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
            className="w-full bg-slate-900/60 border-slate-800 text-slate-200 h-11 rounded-xl min-h-[44px]"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder ? t(field.placeholder, field.placeholder) : ""}
            className="w-full bg-slate-900/60 border-slate-800 text-slate-200 rounded-xl min-h-[80px]"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder ? t(field.placeholder, field.placeholder) : ""}
            className="w-full bg-slate-900/60 border-slate-800 text-slate-200 h-11 rounded-xl min-h-[44px]"
          />
        );

      case "boolean":
        return (
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3 min-h-[44px]">
            <Label className="text-sm font-medium text-slate-200 cursor-pointer">{field.label ? t(field.label) : ""}</Label>
            <Switch checked={value || false} onCheckedChange={(v) => onChange(field.key, v)} />
          </div>
        );

      case "select":
        return (
          <div className="space-y-2 w-full">
            {field.label && <Label className="text-sm font-semibold text-slate-200">{t(field.label)}</Label>}
            <Select value={value || ""} onValueChange={(v) => onChange(field.key, v)}>
              <SelectTrigger className="w-full bg-slate-900/60 border-slate-800 text-slate-200 h-11 rounded-xl min-h-[44px]">
                <SelectValue placeholder={t("common.select", "Select")} />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-60">
                {field.options?.map((opt: any) => {
                  const val = typeof opt === "string" || typeof opt === "number" ? String(opt) : opt.value;
                  const lbl = typeof opt === "string" || typeof opt === "number" ? String(opt) : opt.label;
                  return <SelectItem key={val} value={val}>{t(lbl, lbl)}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        );

      case "multi-select":
        const selectedArr = (value || []) as string[];
        return (
          <div className="space-y-2 w-full">
            {field.label && <Label className="text-sm font-semibold text-slate-200">{t(field.label)}</Label>}
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
                    className={`flex items-center gap-3 rounded-xl border p-3 text-sm text-left transition-all duration-150 cursor-pointer min-h-[44px] ${
                      isChecked
                        ? "border-cyan-400 bg-cyan-500/15 text-white shadow-[0_0_12px_rgba(0,229,255,0.15)]"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                        isChecked ? "border-cyan-400 bg-cyan-400 text-slate-950" : "border-slate-600 bg-transparent"
                      }`}
                    >
                      {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <span className="font-medium text-xs sm:text-sm">{t(lbl, lbl)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case "slider":
        return (
          <div className="space-y-2 w-full">
            <Label className="text-sm font-semibold text-slate-200">
              {t(field.label)}: {value ? value[0] : 0}h
            </Label>
            <Slider value={value || [0]} onValueChange={(v) => onChange(field.key, v)} min={1} max={14} step={0.5} className="py-2" />
          </div>
        );

      case "file":
        return (
          <div className="space-y-2 w-full">
            {field.label && <Label className="text-sm font-semibold text-slate-200">{t(field.label)}</Label>}
            <Input
              type="file"
              onChange={(e) => onChange(field.key, e.target.files?.[0])}
              className="w-full bg-slate-900/60 border-slate-800 text-slate-200 file:bg-cyan-500/20 file:text-cyan-300 file:border-0 file:rounded-md file:mr-3 file:py-1 file:px-2 min-h-[44px]"
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
      {field.label && <Label className="text-sm font-semibold text-slate-200">{t(field.label)}</Label>}
      {renderField()}
    </div>
  );
}
