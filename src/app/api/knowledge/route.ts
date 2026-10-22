import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { KnowledgeCategory, ApprovalStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    const where: any = {};
    if (category && category !== "ALL") {
      where.category = category as KnowledgeCategory;
    }
    if (status && status !== "ALL") {
      where.approvalStatus = status as ApprovalStatus;
    }

    const items = await prisma.knowledgeItem.findMany({
      where,
      include: { brand: true },
      orderBy: { createdAt: "desc" },
    });

    const mappedItems = items.map((item) => ({
      ...item,
      isExpired: item.expiryDate ? new Date(item.expiryDate).getTime() < Date.now() : false,
    }));

    const counts = {
      total: items.length,
      productFacts: items.filter((i) => i.category === KnowledgeCategory.PRODUCT_FACT).length,
      permittedClaims: items.filter((i) => i.category === KnowledgeCategory.PERMITTED_CLAIM).length,
      prohibitedClaims: items.filter((i) => i.category === KnowledgeCategory.PROHIBITED_CLAIM).length,
      mandatoryDisclosures: items.filter((i) => i.category === KnowledgeCategory.MANDATORY_DISCLOSURE).length,
      expired: mappedItems.filter((i) => i.isExpired).length,
    };

    return NextResponse.json({ items: mappedItems, counts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      content,
      category,
      sourceDocument,
      sourceExcerpt,
      owner,
      approvalStatus,
      expiryDate,
      userId,
      userName,
      userRole,
    } = body;

    const brand = await prisma.brand.findFirst();
    if (!brand) throw new Error("No active brand found.");

    const newItem = await prisma.knowledgeItem.create({
      data: {
        id: id || `KB-VER-${Math.floor(100 + Math.random() * 900)}`,
        brandId: brand.id,
        title,
        content,
        category: category as KnowledgeCategory,
        sourceDocument: sourceDocument || "Brand Specification Sheet",
        sourceExcerpt: sourceExcerpt || content,
        owner: owner || "Regulatory Compliance",
        approvalStatus: (approvalStatus as ApprovalStatus) || ApprovalStatus.APPROVED,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "KNOWLEDGE_ITEM_CREATED",
        userId: userId || "usr_admin_01",
        userName: userName || "Sarah Chen",
        userRole: userRole || "BRAND_ADMIN",
        entityType: "KNOWLEDGE_ITEM",
        entityId: newItem.id,
        details: JSON.stringify({
          title: newItem.title,
          category: newItem.category,
          approvalStatus: newItem.approvalStatus,
        }),
      },
    });

    return NextResponse.json(newItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
