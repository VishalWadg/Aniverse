import React from "react";
import { Controller, type Control } from "react-hook-form";
import MonolithEditor from "./Editors/MonolithEditor";

type RTEProps = {
  name: string;
  titleName: string;
  control: Control<any>;
  defaultValue?: string;
  titleDefaultValue?: string;
  placeholder?: string;
};

export default function RTE({
  name,
  titleName,
  control,
  defaultValue = "",
  titleDefaultValue = "",
  placeholder,
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
              <MonolithEditor
                title={(titleField.value as string) ?? ""}
                onTitleChange={titleField.onChange}
                value={(contentField.value as string) ?? ""}
                onChange={contentField.onChange}
                placeholder={placeholder}
              />
            </div>
          )}
        />
      )}
    />
  );
}
