"use client";

import React, { useEffect, useState } from "react";
import {
  Database,
  Filter,
  Search,
  Plus,
  ShieldCheck,
  AlertCircle,
  FileText,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

export const KnowledgeView: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Item Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("PRODUCT_FACT");
  const [newContent, setNewContent] = useState("");
  const [newSourceDoc, setNewSourceDoc] = useState("");
  const [newSourceExcerpt, setNewSourceExcerpt] = useState("");
  const [newOwner, setNewOwner] = useState("Brand Regulatory Board");

  const fetchItems = async () => {
    try {
      const res = await fetch(`/api/knowledge?category=${selectedCategory}`);
      const json = await res.json();
      setItems(json.items || []);
      setCounts(json.counts || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory,
          content: newContent,
          sourceDocument: newSourceDoc,
          sourceExcerpt: newSourceExcerpt,
          owner: newOwner,
          approvalStatus: "APPROVED",
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewTitle("");
        setNewContent("");
        setNewSourceDoc("");
        setNewSourceExcerpt("");
        fetchItems();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "PRODUCT_FACT":
        return { bg: "bg-blue-50 text-blue-700 border-blue-200", label: "Product Fact" };
      case "PERMITTED_CLAIM":
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Permitted Claim" };
      case "PROHIBITED_CLAIM":
        return { bg: "bg-red-50 text-red-700 border-red-200", label: "Prohibited Claim" };
      case "MANDATORY_DISCLOSURE":
        return { bg: "bg-purple-50 text-purple-700 border-purple-200", label: "Mandatory Disclosure" };
      case "GUIDELINE":
        return { bg: "bg-amber-50 text-amber-700 border-amber-200", label: "Guideline" };
      case "TERMINOLOGY":
        return { bg: "bg-slate-50 text-slate-700 border-slate-200", label: "Terminology" };
      default:
        return { bg: "bg-gray-50 text-gray-700 border-gray-200", label: cat };
    }
  };

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.sourceExcerpt?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900">Brand Knowledge Centre</h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
              Single Source of Truth
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Approved evidence repository for fictional brand <strong className="text-slate-800">Verdanta Foods</strong>. Marketing drafts are strictly checked against these verified specifications, claims, and brand disclosures.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Item</span>
        </button>
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: "ALL", label: `All Items (${counts.total || 0})` },
            { id: "PRODUCT_FACT", label: `Product Facts (${counts.productFacts || 0})` },
            { id: "PERMITTED_CLAIM", label: `Permitted Claims (${counts.permittedClaims || 0})` },
            { id: "PROHIBITED_CLAIM", label: `Prohibited Claims (${counts.prohibitedClaims || 0})` },
            { id: "MANDATORY_DISCLOSURE", label: `Disclosures (${counts.mandatoryDisclosures || 0})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search truth items, ID, or excerpt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-indigo-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* Knowledge Items Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading Knowledge Items...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
          No knowledge items found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const badge = getCategoryBadge(item.category);
            const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-5 border shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                  isExpired ? "border-amber-300 bg-amber-50/20" : "border-slate-200"
                }`}
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {item.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isExpired ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>EXPIRED (Dec 2023)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>APPROVED v{item.version}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">{item.title}</h3>

                  {/* Body Content */}
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.content}</p>

                  {/* Source Excerpt Card (Crucial for Citation Validation) */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-3">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-indigo-600" />
                        <span>Source Document Excerpt (Verbatim)</span>
                      </span>
                      <span className="text-slate-500 font-mono text-[9px]">{item.sourceDocument}</span>
                    </div>
                    <p className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-md border border-slate-100 italic leading-relaxed">
                      &ldquo;{item.sourceExcerpt}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{item.owner}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {item.expiryDate ? `Expires: ${new Date(item.expiryDate).toLocaleDateString()}` : "Permanent"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Knowledge Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Add Brand Knowledge Item</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Item Title</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Nutritional Specification: Dietary Fiber"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-500 bg-white"
                >
                  <option value="PRODUCT_FACT">Product Fact</option>
                  <option value="PERMITTED_CLAIM">Permitted Claim</option>
                  <option value="PROHIBITED_CLAIM">Prohibited Claim</option>
                  <option value="MANDATORY_DISCLOSURE">Mandatory Disclosure</option>
                  <option value="GUIDELINE">Guideline</option>
                  <option value="TERMINOLOGY">Terminology</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Policy Content / Specification</label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Description of the truth item, rule, or fact..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Source Document Name</label>
                <input
                  value={newSourceDoc}
                  onChange={(e) => setNewSourceDoc(e.target.value)}
                  placeholder="e.g. Verdanta_Lab_Certificate_Analysis_2026.pdf"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Exact Supporting Source Excerpt</label>
                <textarea
                  required
                  rows={2}
                  value={newSourceExcerpt}
                  onChange={(e) => setNewSourceExcerpt(e.target.value)}
                  placeholder="Exact quotation from the document for strict citation matching..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Truth Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
