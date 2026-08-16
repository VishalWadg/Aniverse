import React from "react";
import { Controller, type Control } from "react-hook-form";
import TiptapEditor from "./Editors/TiptapEditor";

type RTEProps = {
  name: string;
  titleName: string;
  control: Control<any>;
  defaultValue?: string;
  titleDefaultValue?: string;
  placeholder?: string;
  onSubmit?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  isEditing?: boolean;
};

export default function RTE({
  name,
  titleName,
  control,
  defaultValue = "",
  titleDefaultValue = "",
  placeholder,
  onSubmit,
  submitLabel,
  isSubmitting,
  isEditing,
}: RTEProps) {
  return (
    <Controller
      name={titleName}
      control={control}
      defaultValue={titleDefaultValue}
      rules={{ required: true }}
      render={({ field: titleField }) => (
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          render={({ field: contentField }) => (
            <div className="w-full text-start">
              <TiptapEditor
                title={(titleField.value as string) ?? ""}
                onTitleChange={titleField.onChange}
                value={(contentField.value as string) ?? ""}
                onChange={contentField.onChange}
                placeholder={placeholder}
                onSubmit={onSubmit}
                submitLabel={submitLabel}
                isSubmitting={isSubmitting}
                isEditing={isEditing}
              />
            </div>
          )}
        />
      )}
    />
  );
}
