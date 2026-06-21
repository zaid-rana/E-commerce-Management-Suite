import * as Yup from "yup";

export const loginValidationSchema = Yup.object({
    email: Yup.string()
        .required("email is required")
        .email("invalid email format"),
    password: Yup.string()
        .required("password is required")
        .min(8, "password must be atleast 8 characters long")
        .matches(
            /[!@#$%^&*(),.?{}|<>]/,
            "password must contain atleast one symbol"
        )
        .matches(/[0-9]/, "password must contain at least one number")
        .matches(
            /[A-Z]/,
            "password must contain al least one uppercase character"
        )
        .matches(
            /[a-z]/,
            "password must contain atleast one lowercase character"
        ),
});

export const signupValidationSchema = Yup.object({
    firstName: Yup.string().required("first name is required"),
    lastName: Yup.string().required("last name is required"),
    email: Yup.string().required("email is required").email("invalid email format"),
    phone: Yup.string().matches(/^\d{10}$/, "phone number must be 10 digits").required(),
    password: Yup.string().required("password is required").matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character."),
    confirmPassword: Yup.string().oneOf([Yup.ref("password"), "password must match"])
        .required("confirm password is required"),
})

export const forgotValidationSchema = Yup.object({
    email: Yup.string()
        .required("Email is required")
        .email("Invalid email format"),
});


export const resetValidationSchema = Yup.object({
    password: Yup.string()
        .required("Password is required")
        .min(8, "Password must be at least 8 characters long")
        .matches(
            /[!@#$%^&*(),.?{}|<>]/,
            "Password must contain at least one symbol"
        )
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(
            /[A-Z]/,
            "Password must contain at least one uppercase character"
        )
        .matches(
            /[a-z]/,
            "Password must contain at least one lowercase character"
        ),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required"),
});

export const createProductValidationSchema = Yup.object().shape({
    productInformation: Yup.object().shape({
        Name: Yup.string()
            .min(3, "Name must be at least 3 characters")
            .required("Product Name is required"),

        SKU: Yup.number()
            .typeError("SKU must be a number")
            .positive("SKU must be positive")
            .integer("SKU must be an integer")
            .required("SKU is required"),

        Weight: Yup.number()
            .typeError("Weight must be a number")
            .positive("Weight must be positive")
            .required("Weight is required"),

        Unit: Yup.string()
            .oneOf(["kg", "g", "lb"], "Invalid unit selected")
            .required("Unit is required"),

        Description: Yup.string()
            .max(1000, "Description cannot exceed 500 characters")
            .notRequired(), // Not required by the schema
    }),

    pricing: Yup.object().shape({
        Price: Yup.number()
            .typeError("Price must be a number")
            .positive("Price must be positive")
            .required("Price is required"),

        // Currency: Yup.string()
        //     .oneOf(["usd", "usdt", "pkr"], "Invalid currency selected")
        //     .required("Currency is required"),

        Availability: Yup.boolean().required("Availability status is required"),
    }),

    organization: Yup.object().shape({
        Vendor: Yup.string().required("Vendor is required"),
        Category: Yup.string().required("Category is required"),
        Collection: Yup.string().notRequired(),

        // Tags is an array of strings, but we validate the array itself
        // Tags: Yup.array().of(Yup.string()).notRequired(),
        Tags: Yup.string().notRequired(),
    }),

    options: Yup.array()
        .of(
            Yup.object().shape({
                // Validates the option name (e.g., "Size")
                name: Yup.string()
                    .trim()
                    .required("Option name is required (e.g., Size, Color)"),

                // Validates the values array (e.g., ["S", "M", "L"])
                values: Yup.array()
                    .of(
                        Yup.string().trim().required("Option value cannot be empty (e.g., 'M')")
                    )
                    .min(1, "Each option must have at least one value")
                    .required("Option values are required"),
            })
        )
        // You must have at least one option (e.g., "Size")
        .min(1, "You must add at least one product option")
        .required("Product options are required"),

    // --- NEW: Validation for 'generatedVariants' table ---
    generatedVariants: Yup.array()
        .of(
            Yup.object().shape({
                // 'combination' is generated, so we trust its shape
                combination: Yup.array().of(
                    Yup.object().shape({
                        name: Yup.string(),
                        value: Yup.string(),
                    })
                ),

                // Price for this specific variant
                price: Yup.number()
                    .typeError("Price must be a number")
                    .positive("Price must be positive")
                    .required("Variant price is required"),

                // Quantity for this specific variant
                quantity: Yup.number()
                    .typeError("Quantity must be a valid number")
                    .min(0, "Quantity can't be negative")
                    .integer("Quantity must be a whole number")
                    .required("Variant quantity is required"),

                // SKU for this specific variant (optional)
                SKU: Yup.string().trim().notRequired(),
            })
        )
        // If you have options, you must have generated variants
        .min(1, "At least one variant combination is required")
        .required("Generated variants are required"),
    // Images is an array of strings (URLs)
    Images: Yup.array()
        .of(Yup.mixed())
        .min(1, "At least one product image is required"),
});