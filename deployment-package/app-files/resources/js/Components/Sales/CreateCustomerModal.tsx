import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { Input } from "@/Components/ui/input"
import { Label } from "@/Components/ui/label"
import { Textarea } from "@/Components/ui/textarea"
import { Switch } from "@/Components/ui/switch"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import axios from "axios"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CreateCustomerModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: (customer: any) => void
}

export function CreateCustomerModal({ open, onOpenChange, onSuccess }: CreateCustomerModalProps) {
    const { t } = useTranslation()
    const { toast } = useToast()
    const [processing, setProcessing] = useState(false)
    const [errors, setErrors] = useState<any>({})
    const [data, setData] = useState({
        name: "",
        code: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        country: "Malaysia",
        tax_identification_number: "",
        credit_limit: "",
        credit_days: "",
        is_active: true,
    })

    const handleChange = (field: string, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        // Clear error when field changes
        if (errors[field]) {
            setErrors((prev: any) => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})

        try {
            const response = await axios.post(route('master.customers.store'), data, {
                headers: {
                    'Accept': 'application/json', // Ensure JSON response
                    'X-Inertia': '', // Explicitly disable Inertia handling for this request if needed, though usually Accept header is enough for controller logic I saw
                }
            })

            // The controller returns the customer object on success if accepts Json
            const newCustomer = response.data

            toast({
                title: t('common.success'),
                description: t('customers.createTitle') + ' ' + t('common.success'),
            })
            onSuccess(newCustomer)

            // Reset form
            setData({
                name: "",
                code: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                postal_code: "",
                country: "Malaysia",
                tax_identification_number: "",
                credit_limit: "",
                credit_days: "",
                is_active: true,
            })

        } catch (error: any) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors)
            } else {
                toast({
                    title: t('common.error'),
                    description: t('common.error'),
                    variant: "destructive",
                })
                console.error(error)
            }
        } finally {
            setProcessing(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('customers.createTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('customers.createDesc')}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <Label htmlFor="name">{t('customers.name')} *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="code">{t('customers.code')}</Label>
                                <Input
                                    id="code"
                                    value={data.code}
                                    onChange={(e) => handleChange("code", e.target.value)}
                                    placeholder={t('customers.codePlaceholder')}
                                />
                                {errors.code && <p className="text-sm text-red-500">{errors.code[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="tax_identification_number">{t('customers.taxId')}</Label>
                                <Input
                                    id="tax_identification_number"
                                    value={data.tax_identification_number}
                                    onChange={(e) => handleChange("tax_identification_number", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">{t('customers.email')}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="phone">{t('customers.phone')}</Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                />
                            </div>

                            <div className="col-span-2">
                                <Label htmlFor="address">{t('customers.address')}</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => handleChange("address", e.target.value)}
                                    rows={2}
                                />
                            </div>

                            <div>
                                <Label htmlFor="city">{t('customers.city')}</Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="postal_code">{t('customers.postalCode')}</Label>
                                <Input
                                    id="postal_code"
                                    value={data.postal_code}
                                    onChange={(e) => handleChange("postal_code", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="state">{t('customers.state')}</Label>
                                <Input
                                    id="state"
                                    value={data.state}
                                    onChange={(e) => handleChange("state", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="country">{t('customers.country')}</Label>
                                <Input
                                    id="country"
                                    value={data.country}
                                    onChange={(e) => handleChange("country", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="credit_limit">{t('customers.creditLimit')}</Label>
                                <Input
                                    id="credit_limit"
                                    type="number"
                                    value={data.credit_limit}
                                    onChange={(e) => handleChange("credit_limit", e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="credit_days">{t('customers.creditDays')}</Label>
                                <Input
                                    id="credit_days"
                                    type="number"
                                    value={data.credit_days}
                                    onChange={(e) => handleChange("credit_days", e.target.value)}
                                />
                            </div>

                            <div className="col-span-2 flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => handleChange("is_active", checked)}
                                />
                                <Label htmlFor="is_active">{t('master.isActiveStatus')}</Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('master.cancel')}
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('customers.createTitle')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
