'use client';

import { CategoryAttribute } from '@/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ReferenceSearch } from '@/components/ReferenceSearch';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

interface DynamicFormFieldProps {
    attribute: CategoryAttribute;
    register: UseFormRegister<Record<string, unknown>>;
    errors: FieldErrors;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setValue: (name: string, value: any) => void;
    productCategory: 'Laptop' | 'Desktop';
    watch: (name: string) => unknown;
}

export function DynamicFormField({
    attribute,
    register,
    errors,
    setValue,
    productCategory,
    watch,
}: DynamicFormFieldProps) {
    const fieldName = `specs.${attribute.key_name}`;
    const specsErrors = errors.specs as Record<string, { message?: string }> | undefined;
    const error = specsErrors?.[attribute.key_name]?.message;

    switch (attribute.input_type) {
        case 'text':
            return (
                <Input
                    label={attribute.label}
                    {...register(fieldName, { required: attribute.is_required && 'Required' })}
                    error={error}
                    required={attribute.is_required}
                />
            );

        case 'number':
            return (
                <Input
                    type="number"
                    step="any"
                    label={attribute.label}
                    unit={attribute.unit}
                    {...register(fieldName, {
                        required: attribute.is_required && 'Required',
                        valueAsNumber: true,
                    })}
                    error={error}
                    required={attribute.is_required}
                />
            );

        case 'select':
            return (
                <Select
                    label={attribute.label}
                    options={attribute.options || []}
                    {...register(fieldName, { required: attribute.is_required && 'Required' })}
                    error={error}
                    required={attribute.is_required}
                />
            );

        case 'checkbox':
            return (
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id={fieldName}
                        {...register(fieldName)}
                        className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                        style={{
                            backgroundColor: 'var(--input-bg)',
                            borderColor: 'var(--border)',
                        }}
                    />
                    <label htmlFor={fieldName} className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {attribute.label}
                    </label>
                </div>
            );

        case 'reference_search':
            const componentType = attribute.filter_context?.component_type as 'CPU' | 'GPU';
            const refIdField = componentType === 'CPU' ? 'cpu_ref_id' : 'gpu_ref_id';
            const currentRefId = watch(refIdField) as number | undefined;

            return (
                <ReferenceSearch
                    label={attribute.label}
                    componentType={componentType}
                    productCategory={productCategory}
                    value={currentRefId ? { id: currentRefId } as never : null}
                    onChange={(component, modelName) => {
                        setValue(fieldName, modelName);
                        setValue(refIdField, component?.id || null);

                        // Auto-fill related fields based on component type
                        if (component) {
                            if (componentType === 'GPU') {
                                // Auto-fill GPU-related fields for BOTH laptop and standalone GPU forms
                                // For laptop form (gpu_ prefix)
                                setValue('specs.gpu_type', 'Dedicated');
                                setValue('specs.gpu_manufacturer', component.manufacturer);
                                // For standalone GPU form (no prefix)
                                setValue('specs.manufacturer', component.manufacturer);

                                if (component.memory_size) {
                                    // Normalize VRAM format: "8 GB" -> "8GB" to match select options
                                    const normalizedVram = component.memory_size.replace(/\s+/g, '');
                                    setValue('specs.gpu_vram', normalizedVram);
                                    setValue('specs.memory_size', normalizedVram);
                                }
                                if (component.memory_type) {
                                    setValue('specs.gpu_vram_type', component.memory_type);
                                    setValue('specs.memory_type', component.memory_type);
                                }
                                if (component.shader_count) {
                                    setValue('specs.gpu_core_count', component.shader_count);
                                    setValue('specs.core_count', component.shader_count);
                                }
                                if (component.chipset) {
                                    setValue('specs.chipset', component.chipset);
                                }
                                if (component.generation) {
                                    setValue('specs.generation', component.generation);
                                }
                                if (component.clock_speed_ghz) {
                                    setValue('specs.clock_speed', component.clock_speed_ghz);
                                }
                                if (component.boost_clock_ghz) {
                                    setValue('specs.boost_clock', component.boost_clock_ghz);
                                }
                                if (component.tdp) {
                                    setValue('specs.tdp', component.tdp);
                                }
                                if (component.memory_bus_width) {
                                    setValue('specs.memory_bus_width', component.memory_bus_width);
                                }
                            } else if (componentType === 'CPU') {
                                // Auto-fill CPU-related fields for BOTH laptop and standalone CPU forms
                                // For laptop form (cpu_ prefix)
                                if (component.cores) {
                                    setValue('specs.cpu_cores', component.cores);
                                    setValue('specs.cores', component.cores);
                                }
                                if (component.threads) {
                                    setValue('specs.cpu_threads', component.threads);
                                    setValue('specs.threads', component.threads);
                                }
                                if (component.clock_speed_ghz) {
                                    setValue('specs.cpu_base_clock', component.clock_speed_ghz);
                                    setValue('specs.clock_speed', component.clock_speed_ghz);
                                }
                                if (component.boost_clock_ghz) {
                                    setValue('specs.cpu_turbo_clock', component.boost_clock_ghz);
                                    setValue('specs.boost_clock', component.boost_clock_ghz);
                                }
                                if (component.l3_cache) {
                                    setValue('specs.cpu_cache', component.l3_cache);
                                    setValue('specs.l3_cache', component.l3_cache);
                                }
                                // Additional fields for standalone CPU form
                                if (component.manufacturer) {
                                    setValue('specs.manufacturer', component.manufacturer);
                                }
                                if (component.socket) {
                                    setValue('specs.socket', component.socket);
                                }
                                if (component.generation) {
                                    setValue('specs.generation', component.generation);
                                }
                                if (component.tdp) {
                                    setValue('specs.tdp', component.tdp);
                                }
                            }
                        }
                    }}
                    required={attribute.is_required}
                    error={error}
                />
            );

        default:
            return (
                <Input
                    label={attribute.label}
                    {...register(fieldName)}
                    error={error}
                />
            );
    }
}
