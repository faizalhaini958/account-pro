import { Label } from "@/Components/ui/label"
import { Input } from "@/Components/ui/input"
import { Textarea } from "@/Components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select"

interface FormFieldProps {
    label: string
    name: string
    type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'textarea' | 'select'
    value: string | number
    onChange: (value: string) => void
    error?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    options?: Array<{ value: string | number; label: string }>
    className?: string
}

export function FormField({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    disabled = false,
    options = [],
    className = '',
}: FormFieldProps) {
    const renderInput = () => {
        switch (type) {
            case 'textarea':
                return (
                    <Textarea
                        id={name}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={error ? 'border-red-500' : ''}
                    />
                )
            case 'select':
                return (
                    <Select
                        value={value.toString()}
                        onValueChange={onChange}
                        disabled={disabled}
                    >
                        <SelectTrigger className={error ? 'border-red-500' : ''}>
                            <SelectValue placeholder={placeholder || 'Select...'} />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((option) => (
                                <SelectItem key={option.value} value={option.value.toString()}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )
            default:
                return (
                    <Input
                        id={name}
                        type={type}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={error ? 'border-red-500' : ''}
                    />
                )
        }
    }

    return (
        <div className={className}>
            <Label htmlFor={name}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderInput()}
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
    )
}
