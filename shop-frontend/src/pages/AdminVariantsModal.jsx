import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import * as variantApi from "../api/productVariantApi";

const unwrap = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  return [];
};

const AdminVariantsModal = ({ productId, productName, productCode, onClose, onChanged }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("options");
  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----- Option form -----
  const emptyOptionForm = { nameJa: "", nameZh: "", nameEn: "", valuesText: "" };
  const [editingOption, setEditingOption] = useState(null);
  const [optionForm, setOptionForm] = useState(emptyOptionForm);

  // ----- Variant form -----
  const emptyVariantForm = { sku: "", price: "", stock: "", optionValueIds: {} };
  const [editingVariant, setEditingVariant] = useState(null);
  const [variantForm, setVariantForm] = useState(emptyVariantForm);

  useEffect(() => {
    if (productId) fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const optsRes = await variantApi.getOptionsApi(productId);
      const varsRes = await variantApi.getVariantsApi(productId);
      setOptions(unwrap(optsRes));
      setVariants(unwrap(varsRes));
    } catch (e) {
      toast.error(t("admin.variants.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Option handlers
  // ============================================================
  const resetOptionForm = () => {
    setEditingOption(null);
    setOptionForm(emptyOptionForm);
  };

  const formatValueLine = (v) => {
    if (!v) return "";
    return v.code ? `${v.valueJa}|${v.code}` : (v.valueJa || "");
  };

  const parseValueLine = (line, index) => {
    const parts = line.split("|").map((s) => s.trim());
    const valueJa = parts[0] || "";
    const code = parts.length > 1 ? (parts.slice(1).join("|").trim() || null) : null;
    return { valueJa, code, sortOrder: index };
  };

  const startEditOption = (opt) => {
    setEditingOption(opt);
    setOptionForm({
      nameJa: opt.nameJa || "",
      nameZh: opt.nameZh || "",
      nameEn: opt.nameEn || "",
      valuesText: (opt.values || []).map(formatValueLine).join("\n"),
    });
  };

  const submitOption = async (e) => {
    e.preventDefault();
    const valuesArr = optionForm.valuesText
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map(parseValueLine)
      .filter((v) => v.valueJa.length > 0);

    if (!optionForm.nameJa.trim()) {
      toast.error(t("admin.variants.nameJaRequired"));
      return;
    }
    if (valuesArr.length === 0) {
      toast.error(t("admin.variants.valuesRequired"));
      return;
    }

    const payload = {
      nameJa: optionForm.nameJa.trim(),
      nameZh: optionForm.nameZh.trim() || null,
      nameEn: optionForm.nameEn.trim() || null,
      sortOrder: editingOption ? editingOption.sortOrder || 0 : options.length,
      values: valuesArr,
    };

    try {
      if (editingOption) {
        await variantApi.updateOptionApi(editingOption.id, payload);
        toast.success(t("admin.variants.optionUpdated"));
      } else {
        await variantApi.createOptionApi(productId, payload);
        toast.success(t("admin.variants.optionCreated"));
      }
      resetOptionForm();
      fetchAll();
      onChanged && onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.message || t("admin.variants.saveFailed"));
    }
  };

  const deleteOption = async (id) => {
    if (!window.confirm(t("admin.variants.confirmDeleteOption"))) return;
    try {
      await variantApi.deleteOptionApi(id);
      toast.success(t("admin.variants.deleted"));
      fetchAll();
      onChanged && onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.message || t("admin.variants.deleteFailed"));
    }
  };

  // ============================================================
  // Variant handlers
  // ============================================================
  const resetVariantForm = () => {
    setEditingVariant(null);
    setVariantForm(emptyVariantForm);
  };

  const startEditVariant = (v) => {
    const valueIds = {};
    (v.optionValues || []).forEach((p) => {
      valueIds[p.optionId] = String(p.valueId);
    });
    setEditingVariant(v);
    setVariantForm({
      sku: v.sku || "",
      price: String(v.price ?? ""),
      stock: String(v.stock ?? ""),
      optionValueIds: valueIds,
    });
  };

  const handleVariantOptionChange = (optionId, valueId) => {
    setVariantForm((prev) => ({
      ...prev,
      optionValueIds: { ...prev.optionValueIds, [optionId]: valueId },
    }));
  };

  const getSelectedValuesForSku = () => {
    return options.map((opt) => {
      const selectedId = variantForm.optionValueIds[opt.id];
      const value = (opt.values || []).find((v) => String(v.id) === String(selectedId));
      return { option: opt, value };
    });
  };

  const generateSku = () => {
    if (!productCode) {
      toast.error(t("admin.variants.productCodeMissing"));
      return;
    }

    const selected = getSelectedValuesForSku();
    if (selected.some((item) => !item.value)) {
      toast.error(t("admin.variants.selectAllOptionsForSku"));
      return;
    }

    const missingCode = selected.find((item) => !item.value.code);
    if (missingCode) {
      toast.error(t("admin.variants.optionCodeMissing"));
      return;
    }

    const sku = [productCode, ...selected.map((item) => item.value.code)].join("-");
    setVariantForm((prev) => ({ ...prev, sku }));
    toast.success(t("admin.variants.skuGenerated"));
  };

  const submitVariant = async (e) => {
    e.preventDefault();

    if (!variantForm.price || isNaN(Number(variantForm.price))) {
      toast.error(t("admin.variants.priceInvalid"));
      return;
    }
    if (variantForm.stock === "" || isNaN(Number(variantForm.stock))) {
      toast.error(t("admin.variants.stockInvalid"));
      return;
    }

    // 收集 optionValueIds，必須每個 option 都選了
    const ids = options
      .map((opt) => variantForm.optionValueIds[opt.id])
      .filter((x) => x !== undefined && x !== "" && x !== null);

    if (ids.length !== options.length) {
      toast.error(t("admin.variants.allOptionsRequired"));
      return;
    }

    const payload = {
      sku: variantForm.sku.trim() || null,
      price: Number(variantForm.price),
      stock: Number(variantForm.stock),
      status: "ACTIVE",
      sortOrder: editingVariant ? editingVariant.sortOrder || 0 : variants.length,
      optionValueIds: ids.map(Number),
    };

    try {
      if (editingVariant) {
        await variantApi.updateVariantApi(editingVariant.id, payload);
        toast.success(t("admin.variants.variantUpdated"));
      } else {
        await variantApi.createVariantApi(productId, payload);
        toast.success(t("admin.variants.variantCreated"));
      }
      resetVariantForm();
      fetchAll();
      onChanged && onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.message || t("admin.variants.saveFailed"));
    }
  };

  const deleteVariant = async (id) => {
    if (!window.confirm(t("admin.variants.confirmDeleteVariant"))) return;
    try {
      await variantApi.deleteVariantApi(id);
      toast.success(t("admin.variants.deleted"));
      fetchAll();
      onChanged && onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.message || t("admin.variants.deleteFailed"));
    }
  };

  // ============================================================
  // Render helpers
  // ============================================================
  const customVariants = variants.filter((v) => !v.isDefault);

  const formatVariantCombo = (v) => {
    if (!v.optionValues || v.optionValues.length === 0) return "-";
    return v.optionValues.map((p) => `${p.optionNameJa}:${p.valueJa}`).join(" / ");
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-lg">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 text-white p-4 flex justify-between z-10">
          <h2 className="font-bold">
            {t("admin.variants.title")} - {productName}
            {productCode ? <span className="ml-2 text-xs text-amber-300 font-mono">({productCode})</span> : null}
          </h2>
          <button onClick={onClose} className="text-2xl">{"✕"}</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("options")}
            className={
              "flex-1 py-3 px-4 font-bold " +
              (activeTab === "options"
                ? "border-b-2 border-amber-600 text-amber-600"
                : "text-slate-500 hover:text-slate-700")
            }
          >
            {t("admin.variants.tabOptions")} ({options.length})
          </button>
          <button
            onClick={() => setActiveTab("variants")}
            className={
              "flex-1 py-3 px-4 font-bold " +
              (activeTab === "variants"
                ? "border-b-2 border-amber-600 text-amber-600"
                : "text-slate-500 hover:text-slate-700")
            }
          >
            {t("admin.variants.tabVariants")} ({customVariants.length})
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400">
              {t("common.loading")}
            </div>
          ) : activeTab === "options" ? (
            // ========== Options Tab ==========
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-200">
                {t("admin.variants.existingOptions")}
              </h3>

              {options.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">
                  {t("admin.variants.noOptions")}
                </p>
              ) : (
                <div className="space-y-3 mb-6">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className="border border-slate-200 rounded-lg p-3 flex items-start justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-slate-800">
                          {opt.nameJa}
                          {opt.nameZh ? ` / ${opt.nameZh}` : ""}
                          {opt.nameEn ? ` / ${opt.nameEn}` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(opt.values || []).map((v) => (
                            <span
                              key={v.id}
                              className="inline-block bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded"
                            >
                              {v.valueJa}
                              {v.code ? <span className="ml-1 font-mono text-amber-700">({v.code})</span> : null}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <button
                          onClick={() => startEditOption(opt)}
                          className="text-xs py-1 px-2 bg-slate-100 border border-slate-300 font-bold rounded"
                        >
                          {t("admin.variants.edit")}
                        </button>
                        <button
                          onClick={() => deleteOption(opt.id)}
                          className="text-xs py-1 px-2 bg-red-50 border border-red-200 text-red-600 font-bold rounded"
                        >
                          {t("admin.variants.delete")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add / Edit Option form */}
              <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-200">
                {editingOption ? t("admin.variants.editOption") : t("admin.variants.addOption")}
              </h3>
              <form onSubmit={submitOption} className="space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    placeholder={t("admin.variants.nameJaPh")}
                    value={optionForm.nameJa}
                    onChange={(e) => setOptionForm({ ...optionForm, nameJa: e.target.value })}
                    className="p-2 border rounded"
                    required
                  />
                  <input
                    placeholder={t("admin.variants.nameZhPh")}
                    value={optionForm.nameZh}
                    onChange={(e) => setOptionForm({ ...optionForm, nameZh: e.target.value })}
                    className="p-2 border rounded"
                  />
                  <input
                    placeholder={t("admin.variants.nameEnPh")}
                    value={optionForm.nameEn}
                    onChange={(e) => setOptionForm({ ...optionForm, nameEn: e.target.value })}
                    className="p-2 border rounded"
                  />
                </div>
                <textarea
                  placeholder={t("admin.variants.valuesPh")}
                  value={optionForm.valuesText}
                  onChange={(e) => setOptionForm({ ...optionForm, valuesText: e.target.value })}
                  rows={4}
                  className="p-2 border rounded w-full font-mono text-sm"
                  required
                />
                <p className="text-xs text-amber-700">
                  {t("admin.variants.valuesHint")}
                </p>
                <div className="flex justify-end gap-2">
                  {editingOption && (
                    <button type="button" onClick={resetOptionForm} className="px-4 py-2 bg-slate-200 rounded">
                      {t("admin.variants.cancel")}
                    </button>
                  )}
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-white font-bold rounded">
                    {editingOption ? t("admin.variants.update") : t("admin.variants.add")}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // ========== Variants Tab ==========
            <div>
              {options.length === 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
                  {t("admin.variants.needOptionFirst")}
                </div>
              )}

              <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-200">
                {t("admin.variants.existingVariants")}
              </h3>

              {customVariants.length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">
                  {t("admin.variants.noVariants")}
                </p>
              ) : (
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-xs">
                        <th className="p-2">SKU</th>
                        <th className="p-2">{t("admin.variants.combo")}</th>
                        <th className="p-2">{t("admin.variants.priceLabel")}</th>
                        <th className="p-2">{t("admin.variants.stockLabel")}</th>
                        <th className="p-2">{t("admin.variants.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customVariants.map((v) => (
                        <tr key={v.id} className="border-b">
                          <td className="p-2 font-mono">{v.sku}</td>
                          <td className="p-2">{formatVariantCombo(v)}</td>
                          <td className="p-2 text-amber-600 font-bold">
                            {"¥"}{Number(v.price).toLocaleString()}
                          </td>
                          <td className="p-2">
                            {v.stock > 0 ? (
                              <span className="text-green-600 font-bold">{v.stock}</span>
                            ) : (
                              <span className="text-red-500 font-bold">0</span>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-1">
                              <button
                                onClick={() => startEditVariant(v)}
                                className="text-xs py-1 px-2 bg-slate-100 border border-slate-300 font-bold rounded"
                              >
                                {t("admin.variants.edit")}
                              </button>
                              <button
                                onClick={() => deleteVariant(v.id)}
                                className="text-xs py-1 px-2 bg-red-50 border border-red-200 text-red-600 font-bold rounded"
                              >
                                {t("admin.variants.delete")}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add / Edit Variant form */}
              {options.length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-200">
                    {editingVariant ? t("admin.variants.editVariant") : t("admin.variants.addVariant")}
                  </h3>
                  <form onSubmit={submitVariant} className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex gap-2">
                      <input
                        placeholder={t("admin.variants.skuPh")}
                        value={variantForm.sku}
                        onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
                        className="w-full p-2 border rounded font-mono"
                      />
                      <button
                        type="button"
                        onClick={generateSku}
                        className="shrink-0 px-3 py-2 bg-slate-900 text-white text-xs font-bold rounded hover:bg-amber-600"
                      >
                        {t("admin.variants.generateSku")}
                      </button>
                    </div>
                    <p className="text-xs text-blue-700">
                      {t("admin.variants.skuHint")}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {options.map((opt) => (
                        <div key={opt.id}>
                          <label className="block text-xs text-slate-600 mb-1">{opt.nameJa}</label>
                          <select
                            value={variantForm.optionValueIds[opt.id] || ""}
                            onChange={(e) => handleVariantOptionChange(opt.id, e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                          >
                            <option value="">{t("admin.variants.selectValue")}</option>
                            {(opt.values || []).map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.valueJa}{v.code ? ` (${v.code})` : ""}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder={t("admin.variants.priceLabel")}
                        type="number"
                        value={variantForm.price}
                        onChange={(e) => setVariantForm({ ...variantForm, price: e.target.value })}
                        className="p-2 border rounded"
                        required
                      />
                      <input
                        placeholder={t("admin.variants.stockLabel")}
                        type="number"
                        value={variantForm.stock}
                        onChange={(e) => setVariantForm({ ...variantForm, stock: e.target.value })}
                        className="p-2 border rounded"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      {editingVariant && (
                        <button type="button" onClick={resetVariantForm} className="px-4 py-2 bg-slate-200 rounded">
                          {t("admin.variants.cancel")}
                        </button>
                      )}
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-bold rounded">
                        {editingVariant ? t("admin.variants.update") : t("admin.variants.add")}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminVariantsModal;
