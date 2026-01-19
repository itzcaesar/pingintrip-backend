"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";

import api from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const bookingFormSchema = z.object({
    customerName: z.string().min(3, "Customer name is required"),
    phone: z.string().min(10, "Valid phone number required").startsWith("+62", "Must start with +62"),
    vehicleType: z.enum(["CAR", "MOTOR", "VAN"]),
    pickupDate: z.date(),
    duration: z.coerce.number().min(1, "Minimum 1 day").max(30, "Maximum 30 days"),
    pickupLocation: z.string().min(3, "Pickup location is required"),
    dropoffLocation: z.string().min(3, "Dropoff location is required"),
    source: z.literal("MANUAL"),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const defaultValues: Partial<BookingFormValues> = {
    customerName: "",
    phone: "+62",
    vehicleType: "CAR",
    duration: 1,
    pickupLocation: "Ngurah Rai Airport",
    dropoffLocation: "Ubud Center",
    source: "MANUAL",
};

export function BookingFormModal({ open, onOpenChange }: BookingFormModalProps) {
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingFormSchema) as any,
        defaultValues,
    });

    // Reset form when opening
    const handleOpenChange = (newOpen: boolean) => {
        if (newOpen) {
            form.reset(defaultValues);
        }
        onOpenChange(newOpen);
    };

    const createMutation = useMutation({
        mutationFn: async (data: BookingFormValues) => {
            await api.post("/bookings", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings-list"] });
            queryClient.invalidateQueries({ queryKey: ["report-stats"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            queryClient.invalidateQueries({ queryKey: ["all-bookings-for-customers"] }); // For customers page
            toast.success("Booking created successfully");
            handleOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create booking");
        },
        onSettled: () => {
            setIsSubmitting(false);
        }
    });

    const onSubmit = (data: BookingFormValues) => {
        setIsSubmitting(true);
        createMutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Booking</DialogTitle>
                    <DialogDescription>
                        Manually create a booking. This will also create the customer record.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Customer Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Phone</FormLabel>
                                        <FormControl>
                                            <Input placeholder="+62 812..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vehicleType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vehicle Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CAR">Car</SelectItem>
                                                <SelectItem value="MOTOR">Motorcycle</SelectItem>
                                                <SelectItem value="VAN">Van</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="pickupDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Pickup Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date(new Date().setHours(0, 0, 0, 0))
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (Days)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="pickupLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pickup Loc</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dropoffLocation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Dropoff Loc</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Booking
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
