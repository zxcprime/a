// settings-row.tsx
import { ChevronRight, ExternalLink } from "lucide-react";
import { SettingsItem } from "./data";

type Props = {
  item: SettingsItem;
  onClick: () => void;
};

export function SettingsRow({
  item: { label, value, Icon, action },
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full lg:px-2 px-1.5 lg:py-3 py-2.5 gap-3 hover:bg-neutral-800 transition-colors rounded-sm"
    >
      <div className="flex items-center lg:gap-3 gap-2">
        <Icon size={18} className="text-neutral-400 shrink-0" />
        <span className="text-neutral-300 lg:text-base text-sm line-clamp-1 text-left">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {value != null && (
          <span className="text-neutral-500 lg:text-base text-sm line-clamp-1 max-w-20">
            {value}
          </span>
        )}
        {action ? (
          <ExternalLink size={16} className="text-neutral-600" />
        ) : (
          <ChevronRight size={16} className="text-neutral-600" />
        )}
      </div>
    </button>
  );
}
