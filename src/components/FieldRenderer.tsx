import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/config/onboardingSchema";
import { Check } from "lucide-react";

interface FieldRendererProps {
  field: FormField;
  value: any;
  onChange: (key: string, value: any) => void;
  data: any; // The full form data state for evaluating conditions
}

export function FieldRenderer({ field, value, onChange, data }: FieldRendererProps) {
  const { t } = useTranslation();

  // Evaluate condition if present
  if (field.condition && !field.condition(data)) {
    return null;
  }

  const renderField = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder ? t(field.placeholder, field.placeholder) : ""}
            className="w-full bg-slate-50 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 focus:ring-teal-600/20 h-11 rounded-xl min-h-[44px] shadow-sm font-medium"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder ? t(field.placeholder, field.placeholder) : ""}
            className="w-full bg-slate-50 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 focus:ring-teal-600/20 rounded-xl min-h-[80px] shadow-sm font-medium"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder ? t(field.placeholder, field.placeholder) : ""}
            className="w-full bg-slate-50 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 focus:ring-teal-600/20 h-11 rounded-xl min-h-[44px] shadow-sm font-medium"
          />
        );

      case "boolean":
        return (
          <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 p-3.5 min-h-[48px] shadow-sm">
            <Label className="text-sm font-bold text-slate-800 dark:text-slate-100 cursor-pointer select-none">
              {field.label ? t(field.label) : ""}
            </Label>
            <Switch checked={value || false} onCheckedChange={(v) => onChange(field.key, v)} />
          </div>
        );

      case "select":
        return (
          <div className="space-y-2 w-full">
            {field.label && (
              <Label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {t(field.label)}
              </Label>
            )}
            <Select value={value || ""} onValueChange={(v) => onChange(field.key, v)}>
              <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 h-11 rounded-xl min-h-[44px] shadow-sm font-medium">
                <SelectValue placeholder={t("common.select", "Select")} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-60 shadow-xl z-[200]">
                {field.options?.map((opt: any) => {
                  const val = typeof opt === "string" || typeof opt === "number" ? String(opt) : opt.value;
                  const lbl = typeof opt === "string" || typeof opt === "number" ? String(opt) : opt.label;
                  return (
                    <SelectItem key={val} value={val} className="hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-900 dark:text-slate-100">
                      {t(lbl, lbl)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        );

      case "multi-select":
        const selectedArr = (value || []) as string[];
        return (
          <div className="space-y-2 w-full">
            {field.label && (
              <Label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {t(field.label)}
              </Label>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {field.options?.map((opt: any) => {
                const val = typeof opt === "string" || typeof opt === "number" ? String(opt) : opt.value;
                const lbl = typeof opt === "string" || typeof opt === "number" ? String(opt) : opt.label;
                const isChecked = selectedArr.includes(val);
                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      const newArr = selectedArr.includes(val)
                        ? selectedArr.filter((i) => i !== val)
                        : [...selectedArr, val];
                      onChange(field.key, newArr);
                    }}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-sm text-left transition-all duration-150 cursor-pointer min-h-[46px] shadow-sm ${
                      isChecked
                        ? "border-teal-600 bg-teal-50 dark:bg-teal-950/40 text-teal-950 dark:text-teal-200 font-bold ring-2 ring-teal-500/20"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 font-medium"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                        isChecked ? "border-teal-600 bg-teal-600 text-white" : "border-slate-400 dark:border-slate-600 bg-transparent"
                      }`}
                    >
                      {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-xs sm:text-sm">{t(lbl, lbl)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "slider":
        return (
          <div className="space-y-2 w-full">
            <Label className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t(field.label)}: {value ? value[0] : 0}h
            </Label>
            <Slider value={value || [0]} onValueChange={(v) => onChange(field.key, v)} min={1} max={14} step={0.5} className="py-2" />
          </div>
        );

      case "file":
        return (
          <div className="space-y-2 w-full">
            {field.label && (
              <Label className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {t(field.label)}
              </Label>
            )}
            <Input
              type="file"
              onChange={(e) => onChange(field.key, e.target.files?.[0])}
              className="w-full bg-slate-50 dark:bg-slate-900/80 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 file:bg-teal-600 file:text-white file:border-0 file:rounded-lg file:mr-3 file:py-1 file:px-3 file:font-semibold min-h-[44px] shadow-sm"
            />
          </div>
        );

      default:
        return null;
    }
  };

  // For types that render their own top-level wrappers and labels
  if (
    field.type === "boolean" ||
    field.type === "select" ||
    field.type === "multi-select" ||
    field.type === "slider" ||
    field.type === "file"
  ) {
    return renderField();
  }

  // Wrapper for bare inputs like text and textarea
  return (
    <div className="space-y-2 w-full">
      {field.label && (
        <Label className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {t(field.label)}
        </Label>
      )}
      {renderField()}
    </div>
  );
}
