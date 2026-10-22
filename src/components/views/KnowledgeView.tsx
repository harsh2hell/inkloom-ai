"use client";

import React, { useEffect, useState } from "react";
import {
  Database,
  Search,
  Plus,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  X,
} from "lucide-react";

export const KnowledgeView: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // New Item Form State
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("PRODUCT_FACT");
  const [newContent, setNewContent] = useState("");
  const [newSourceDoc, setNewSourceDoc] = useState("");
  const [newSourceExcerpt, setNewSourceExcerpt] = useState("");
  const [newOwner, setNewOwner] = useState("Brand Regulatory Board");

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/knowledge?category=${selectedCategory}`);
      if (!res.ok) {
        throw new Error(`Failed to load knowledge items (HTTP ${res.status})`);
      }
      const json = await res.json();
      setItems(json.items || []);
      setCounts(json.counts || {});
    } catch (e: any) {
      console.error("Knowledge fetch error:", e);
      setError(e.message || "Failed to load knowledge base");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create knowledge item");
      }
      setShowAddModal(false);
      setNewTitle("");
      setNewContent("");
      setNewSourceDoc("");
      setNewSourceExcerpt("");
      fetchItems();
    } catch (e: any) {
      console.error("Error creating knowledge item:", e);
      setAddError(e.message || "Failed to create knowledge item");
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "PRODUCT_FACT":
        return { label: "Product Fact", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "PERMITTED_CLAIM":
        return { label: "Permitted Claim", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "PROHIBITED_CLAIM":
        return { label: "Prohibited Claim", color: "bg-rose-50 text-rose-700 border-rose-200" };
      case "MANDATORY_DISCLOSURE":
        return { label: "Mandatory Disclosure", color: "bg-purple-50 text-purple-700 border-purple-200" };
      case "GUIDELINE":
        return { label: "Guideline", color: "bg-amber-50 text-amber-700 border-amber-200" };
      default:
        return { label: cat, color: "bg-slate-50 text-slate-700 border-slate-200" };
    }
  };

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.content.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.sourceDocument?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Brand Knowledge Centre</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Single source of truth for Verdanta Foods: approved facts, permitted claims, prohibited terms, and mandatory disclosures.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Knowledge Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: "ALL", label: `All (${counts.total ?? items.length})` },
            { id: "PRODUCT_FACT", label: `Facts (${counts.productFacts ?? 0})` },
            { id: "PERMITTED_CLAIM", label: `Permitted (${counts.permittedClaims ?? 0})` },
            { id: "PROHIBITED_CLAIM", label: `Prohibited (${counts.prohibitedClaims ?? 0})` },
            { id: "MANDATORY_DISCLOSURE", label: `Disclosures (${counts.mandatoryDisclosures ?? 0})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search truth items..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Knowledge Item Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Loading Knowledge Items...</div>
      ) : error ? (
        <div className="py-16 text-center text-xs saas-card max-w-md mx-auto p-6 space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Failed to Retrieve Knowledge Base</h3>
          <p className="text-xs text-rose-600">{error}</p>
          <button
            onClick={fetchItems}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
          >
            Retry
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 saas-card">
          No knowledge items match the search query or filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const badge = getCategoryBadge(item.category);
            const isExpired = Boolean(item.isExpired);
            const formattedExpiry = item.expiryDate
              ? new Date(item.expiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "";
            return (
              <div
                key={item.id}
                className={`saas-card p-4 flex flex-col justify-between transition-all ${
                  isExpired ? "border-amber-300/80 bg-amber-50/15" : "hover:border-slate-300"
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.id}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                      {isExpired && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-300">
                          Expired {formattedExpiry}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 className="text-xs font-bold text-slate-900 leading-snug mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{item.content}</p>
                </div>

                {/* Evidence & Source Footer */}
                <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                  <div className="flex items-center justify-between text-slate-400 text-[10px]">
                    <span className="truncate max-w-[150px]">Owner: {item.owner}</span>
                    <span>
                      {item.expiryDate
                        ? `Expiry: ${new Date(item.expiryDate).toLocaleDateString()}`
                        : "Permanent Specification"}
                    </span>
                  </div>

                  {item.sourceDocument && (
                    <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px]">
                      <div className="font-semibold text-slate-700 text-[10px] mb-0.5 flex items-center justify-between">
                        <span>Source: {item.sourceDocument}</span>
                        {isExpired ? (
                          <span className="text-amber-600 font-bold text-[9px]">EXPIRED</span>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[9px]">ACTIVE</span>
                        )}
                      </div>
                      {item.sourceExcerpt && (
                        <p className="text-slate-600 text-[10px] italic leading-tight line-clamp-2">
                          &ldquo;{item.sourceExcerpt}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Knowledge Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-5 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Brand Knowledge Item</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Protein Concentration Specification"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="PRODUCT_FACT">Product Fact</option>
                  <option value="PERMITTED_CLAIM">Permitted Claim</option>
                  <option value="PROHIBITED_CLAIM">Prohibited Claim</option>
                  <option value="MANDATORY_DISCLOSURE">Mandatory Disclosure</option>
                  <option value="GUIDELINE">Guideline</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule / Claim Content</label>
                <textarea
                  required
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Exact factual statement, permitted phrase, or prohibited wording..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Document Reference</label>
                <input
                  type="text"
                  value={newSourceDoc}
                  onChange={(e) => setNewSourceDoc(e.target.value)}
                  placeholder="e.g., Certificate of Analysis 2026-QA-1092"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Verifiable Excerpt in Source</label>
                <textarea
                  rows={2}
                  value={newSourceExcerpt}
                  onChange={(e) => setNewSourceExcerpt(e.target.value)}
                  placeholder="Exact quote from source doc used for application-side citation validation..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-2xs"
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
