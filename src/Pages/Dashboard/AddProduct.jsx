import React, { useRef, useState, useMemo, useEffect } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import apiClient from "../../utils/apiClient";
import { X } from "lucide-react";
import { showToast } from "../../utils/toastHelper";

import {
  TextField,
  Button,
  IconButton,
  Chip,
  Paper,
  Typography,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import { createProductValidationSchema } from "../../utils/Validations";

const AddProduct = () => {
  const INITIAL_FORM_STATE = {
    productInformation: {
      Name: "",
      SKU: "",
      Weight: "",
      Unit: "",
      Description: "",
    },
    pricing: {
      Price: "",
      Currency: "",
      Availability: true, // Typically resets to the default available status
    },
    organization: {
      Vendor: "",
      Category: "",
      Collection: "",
      Tags: [],
    },
    options: [
      // We can start with one blank option for the user to fill in.
      { id: Date.now(), name: "", values: [] },
    ],

    generatedVariants: [],

    specifications: [
      // Start with one blank specification for the user to fill in.
      { id: Date.now(), name: "", value: "" },
    ],

    Images: [], // Resets the array of file objects
  };
  const [formData, setFormData] = useState({
    productInformation: {
      Name: "",
      SKU: "",
      Weight: "",
      Unit: "kg",
      Description: "",
    },
    pricing: {
      // This now acts as the "base price" for the product
      Price: "",
      Currency: "usd",
      Availability: true,
    },
    organization: {
      Vendor: "",
      Category: "",
      Collection: "",
      Tags: [],
    },

    // --- UPDATED FOR DYNAMIC VARIANTS ---

    /** * 1. This array defines the OPTIONS (e.g., "Size", "Color").
     * The user will add values (e.g., "S", "M", "L") to each option.
     */
    options: [
      // We can start with one blank option for the user to fill in.
      { id: Date.now(), name: "", values: [] },
    ],

    /**
     * 2. This array will store the FINAL SKU/price/quantity for
     * each generated combination (e.g., "Size: S / Color: Red").
     * This is what you will save to your database.
     * It's populated by the combination logic from the previous example.
     */
    generatedVariants: [],

    // Note: The old 'variants: [{ size: "", color: "", quantity: "" }]' key
    // is now replaced by 'options' and 'generatedVariants'.

    /**
     * Specifications array for custom product specifications.
     * Each specification has a name (e.g., "Material") and value (e.g., "Cotton").
     */
    specifications: [
      // Start with one blank specification for the user to fill in.
      { id: Date.now(), name: "", value: "" },
    ],

    Images: [],
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  // const [isAvailable, setIsAvailable] = useState(true);
  const isAvailable = formData.pricing.Availability;
  const [errors, setErrors] = useState({});
  const [newValueInputs, setNewValueInputs] = useState(
    Array(formData.options.length).fill("")
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const updateImages = (newFiles) => {
    setFormData((prev) => ({
      ...prev,
      Images: [...prev.Images, ...newFiles], // Append new files to existing ones
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 1. Validate data using Yup schema before sending
      await createProductValidationSchema.validate(formData, {
        abortEarly: false,
      });
      setErrors({});
      console.log("Form data is valid:", formData); // Good for debugging

      // 2. Create FormData
      const productFormData = new FormData();

      // Append Images
      formData.Images.forEach((file) => {
        productFormData.append("Images", file);
      });

      // --- (START) UPDATED SECTION ---

      // Append all other nested JSON data.
      // We must stringify nested objects before appending them to FormData
      // so the backend knows to parse them.

      productFormData.append(
        "productInformation",
        JSON.stringify(formData.productInformation)
      );

      productFormData.append("pricing", JSON.stringify(formData.pricing));

      productFormData.append(
        "organization",
        JSON.stringify(formData.organization)
      );

      // --- THIS IS THE FIX ---

      // (REMOVED) This line was incorrect as 'variants' no longer exists
      // productFormData.append("variants", JSON.stringify(formData.variants));

      // (ADDED) Append the new 'options' array
      productFormData.append("options", JSON.stringify(formData.options));

      // (ADDED) Append the new 'generatedVariants' array
      productFormData.append(
        "generatedVariants",
        JSON.stringify(formData.generatedVariants)
      );

      // (ADDED) Append specifications array
      // Filter out empty specifications (where both name and value are empty)
      const validSpecifications = formData.specifications.filter(
        (spec) => spec.name.trim() !== "" || spec.value.trim() !== ""
      );
      // Map to backend format (remove id, keep only name and value)
      const specificationsForBackend = validSpecifications.map(
        ({ name, value }) => ({
          name,
          value,
        })
      );
      productFormData.append(
        "specifications",
        JSON.stringify(specificationsForBackend)
      );

      // (ADDED) Append 'hasVariants' if you are using it
      // productFormData.append("hasVariants", formData.hasVariants);

      // --- (END) UPDATED SECTION ---

      // 3. Send POST request using apiClient (Axios)
      const res = await apiClient.post(
        "/ecomm/createproducts",
        productFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // 4. Handle success response
      if (res.data?.success) {
        showToast("success", "Product created successfully!");
        setFormData(INITIAL_FORM_STATE);
        // You also need to clear your file input component
        // (e.g., call some 'clearFiles()' function from your uploader)
      } else {
        showToast("error", res.data?.message || "Failed to create product.");
      }
    } catch (error) {
      if (error.name === "ValidationError") {
        // Handle Yup validation errors
        const newErrors = error.inner.reduce((acc, currentError) => {
          // Use setIn from 'formik' or a custom utility for nested paths
          // For simplicity, just logging the path
          acc[currentError.path] = currentError.message;
          return acc;
        }, {});
        setErrors(newErrors);
        console.log("Validation Errors:", newErrors);
        showToast("error", "Please correct the form errors before submitting.");
      } else {
        // Handle API or network errors
        console.error(
          "Error creating product:",
          error.response?.data || error.message
        );
        showToast(
          "error",
          error.response?.data?.message || // Show backend error message
            "An error occurred during product creation. Please try again."
        );
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const isCheckbox = type === "checkbox";
    const newValue = isCheckbox ? checked : value;

    setFormData((prev) => {
      // 1. Split the name attribute to check for nested fields (e.g., "productInformation.Name")
      const [parentKey, childKey] = name.split(".");

      // 2. Check if the name has a nested structure
      if (childKey) {
        // If it's a nested field, update the inner object
        return {
          ...prev,
          [parentKey]: {
            ...prev[parentKey], // Copy existing values of the inner object
            [childKey]: newValue, // Update the specific child field
          },
        };
      } else {
        // 3. If it's a top-level field (like 'Images' array or 'SKU' if restructured)
        return {
          ...prev,
          [name]: newValue,
        };
      }
    });

    // Clear error for this field when user starts typing (adapted for product form)
    // NOTE: You must update your 'errors' state structure to match the nested 'formData' structure
    if (errors && errors[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "",
      }));
    }
  };

  const handleAddOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [
        ...prev.options,
        { id: Date.now(), name: "", values: [] }, // Add a new blank option
      ],
    }));
    // Add a corresponding empty string for the new input field
    setNewValueInputs((prev) => [...prev, ""]);
  };

  const handleRemoveOption = (optionIndex) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, idx) => idx !== optionIndex),
    }));
    // Remove the corresponding input field's state
    setNewValueInputs((prev) => prev.filter((_, idx) => idx !== optionIndex));
  };

  const handleOptionNameChange = (e, optionIndex) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, idx) =>
        idx === optionIndex ? { ...opt, name: newName } : opt
      ),
    }));
  };

  const handleAddOptionValue = (optionIndex) => {
    const newValue = newValueInputs[optionIndex].trim();
    if (newValue === "") return; // Don't add empty values

    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, idx) =>
        idx === optionIndex
          ? { ...opt, values: [...opt.values, newValue] } // Add new value
          : opt
      ),
    }));
    // Clear the input field for that option
    setNewValueInputs((prev) =>
      prev.map((val, idx) => (idx === optionIndex ? "" : val))
    );
  };

  const handleRemoveOptionValue = (optionIndex, valueIndex) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, idx) =>
        idx === optionIndex
          ? {
              ...opt,
              values: opt.values.filter((_, vIdx) => vIdx !== valueIndex),
            } // Remove the value
          : opt
      ),
    }));
  };

  const handleNewValueChange = (e, optionIndex) => {
    const newValue = e.target.value;
    setNewValueInputs((prev) =>
      prev.map((val, idx) => (idx === optionIndex ? newValue : val))
    );
  };

  const getCombinations = (options) => {
    if (options.length === 0) return [[]];
    const [firstOption, ...restOptions] = options;
    const restCombinations = getCombinations(restOptions);
    return firstOption.values.flatMap((value) => {
      return restCombinations.map((combo) => [
        { name: firstOption.name, value: value },
        ...combo,
      ]);
    });
  };

  const allCombinations = useMemo(() => {
    // Filter out options with no name or no values
    const validOptions = formData.options.filter(
      (opt) => opt.name.trim() !== "" && opt.values.length > 0
    );
    if (validOptions.length === 0) return [];
    return getCombinations(validOptions);
    // Re-run only when formData.options changes
  }, [formData.options]);

  useEffect(() => {
    // Create new variant objects from the combinations
    const newGeneratedVariants = allCombinations.map((combo) => {
      // combo is: [{name: 'Size', value: 'S'}, {name: 'Color', value: 'Red'}]

      // Check if this combo already exists in the OLD state, to preserve price/quantity
      // This is a bit more advanced, but for simplicity, we'll reset

      return {
        combination: combo,
        price: formData.pricing.Price || "", // Default to base price
        quantity: 0,
        SKU: "",
      };
    });

    // Save this new array into your formData
    setFormData((prev) => ({
      ...prev,
      generatedVariants: newGeneratedVariants,
    }));

    // Re-run this effect when the combinations change, or when the base price changes
  }, [allCombinations, formData.pricing.Price]);

  const handleVariantDetailChange = (e, comboIndex, fieldName) => {
    const newValue = e.target.value;

    setFormData((prev) => {
      // Create a new array, not mutate the old one
      const newVariants = [...prev.generatedVariants];

      // Update the specific object at the specific index
      newVariants[comboIndex] = {
        ...newVariants[comboIndex],
        [fieldName]: newValue,
      };

      return {
        ...prev,
        generatedVariants: newVariants,
      };
    });
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      Images: prev.Images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    updateImages(files);
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    updateImages(files);
  };

  const handleAvailabilityToggle = () => {
    setFormData((prev) => ({
      ...prev,
      // Target the specific nested object (pricing)
      pricing: {
        ...prev.pricing, // Copy other pricing fields (Price, Currency)
        Availability: !isAvailable, // Toggle the boolean value
      },
    }));
  };

  // ===== SPECIFICATIONS HANDLERS =====
  const handleAddSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [
        ...prev.specifications,
        { id: Date.now(), name: "", value: "" }, // Add a new blank specification
      ],
    }));
  };

  const handleRemoveSpecification = (specId) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((spec) => spec.id !== specId),
    }));
  };

  const handleSpecificationChange = (specId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec) =>
        spec.id === specId ? { ...spec, [field]: value } : spec
      ),
    }));
  };

  return (
    <div className="min-h-100vh p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-[22px] md:text-2xl font-semibold text-gray-900">
            Add Product
          </h1>
          <p className="text-sm text-gray-500">Add Products to your site</p>
        </div>
      </div>

      {/* Content Grid */}
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-6 items-stretch">
          {/* Product Information Container */}
          <div className="h-fit bg-white border-1 border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Product Information
            </h2>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter product name"
                  name="productInformation.Name"
                  value={formData.productInformation.Name}
                  onChange={handleChange}
                />
                {errors && errors["productInformation.Name"] && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors["productInformation.Name"]}
                  </div>
                )}
              </div>

              {/* SKU & Weight (2-column grid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU (Number)
                  </label>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter SKU"
                    value={formData.productInformation.SKU}
                    name="productInformation.SKU"
                    onChange={handleChange}
                  />
                  {errors && errors["productInformation.SKU"] && (
                    <div className="text-red-500 text-xs mt-1">
                      {errors["productInformation.SKU"]}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="number"
                      placeholder="0.00"
                      name="productInformation.Weight"
                      value={formData.productInformation.Weight}
                      onChange={handleChange}
                      className="sm:col-span-2 w-full border border-gray-300 rounded-lg px-3 py-2 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors && errors["productInformation.Weight"] && (
                      <div className="text-red-500 text-xs mt-1 sm:col-span-2">
                        {errors["productInformation.Weight"]}
                      </div>
                    )}
                    <FormControl fullWidth size="small">
                      <InputLabel id="weight-unit-label">Unit</InputLabel>
                      <Select
                        labelId="weight-unit-label"
                        id="weight-unit"
                        value={formData.productInformation.Unit}
                        label="Unit"
                        name="productInformation.Unit"
                        onChange={handleChange}
                      >
                        <MenuItem value="lb">lb</MenuItem>
                        <MenuItem value="kg">kg</MenuItem>
                        <MenuItem value="g">g</MenuItem>
                      </Select>
                    </FormControl>
                    {errors && errors["productInformation.Unit"] && (
                      <div className="text-red-500 text-xs mt-1 col-span-1">
                        {errors["productInformation.Unit"]}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter product description"
                  value={formData.productInformation.Description}
                  name="productInformation.Description"
                  onChange={handleChange}
                  multiline
                  rows={4}
                />
                {errors && errors["productInformation.Description"] && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors["productInformation.Description"]}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Media Container */}
          <div className="h-full bg-white rounded-2xl p-6 flex flex-col border-1 border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Media</h2>

            <div
              className={
                "flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-colors " +
                (isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50")
              }
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onClick={handleBrowseClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*" // Changed to only accept images, as you use 'Images' array
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="text-center">
                <p className="text-sm text-gray-700 font-medium">
                  Drag and drop media files here
                </p>
                <p className="text-xs text-gray-500 mt-1">or click to browse</p>
              </div>
            </div>

            {/* Display selected files, reading directly from formData */}
            {formData.Images.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Selected files
                </p>
                <ul className="text-sm text-gray-600 space-y-2">
                  {formData.Images.map((file, index) => (
                    <li
                      key={file.name + index}
                      className="flex justify-between items-center bg-gray-50 p-2 rounded-lg"
                    >
                      <span>
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="text-red-500 hover:text-red-700 ml-3"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {errors && errors["Images"] && (
              <div className="text-red-500 text-xs mt-2">
                {errors["Images"]}
              </div>
            )}
          </div>
          {/* Varients Container */}
          <div className="space-y-6">
            {/* ===== 1. OPTION DEFINITION UI ===== */}
            <Paper
              elevation={0}
              sx={{ border: 1, borderColor: "grey.200", p: 3 }}
            >
              <Typography variant="h6" gutterBottom>
                Variant Options
              </Typography>
              <Box className="space-y-4">
                {formData.options.map((option, optionIndex) => (
                  <Paper
                    key={option.id}
                    variant="outlined"
                    sx={{ p: 2, position: "relative" }}
                  >
                    {/* Remove Option Button */}
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveOption(optionIndex)}
                      sx={{ position: "absolute", top: 20, right: 20 }}
                      disabled={formData.options.length === 1} // Can't remove the last one
                    >
                      <DeleteIcon />
                    </IconButton>

                    {/* Option Name */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Option Name"
                      placeholder="e.g., Size"
                      value={option.name}
                      onChange={(e) => handleOptionNameChange(e, optionIndex)}
                      sx={{ mb: 2 }}
                    />

                    {/* Option Values (as Chips) */}
                    <Box
                      sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                    >
                      {option.values.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No values added yet.
                        </Typography>
                      )}
                      {option.values.map((value, valueIndex) => (
                        <Chip
                          key={valueIndex}
                          label={value}
                          onDelete={() =>
                            handleRemoveOptionValue(optionIndex, valueIndex)
                          }
                        />
                      ))}
                    </Box>

                    {/* Add New Value Input */}
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Option Value"
                        placeholder="e.g., M (press Enter to add)"
                        value={newValueInputs[optionIndex]}
                        onChange={(e) => handleNewValueChange(e, optionIndex)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault(); // Prevents form submission
                            handleAddOptionValue(optionIndex);
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => handleAddOptionValue(optionIndex)}
                        startIcon={<AddIcon />}
                      >
                        Add
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {/* Button to add a new option type */}
              <Button
                variant="contained"
                onClick={handleAddOption}
                sx={{ mt: 3 }}
                startIcon={<AddIcon />}
              >
                Add Another Option
              </Button>
            </Paper>

            <Divider />

            {/* ===== 2. VARIANT COMBINATION TABLE ===== */}
            {allCombinations.length > 0 && (
              <Paper
                elevation={0}
                sx={{ border: 1, borderColor: "grey.200", p: 3 }}
              >
                <Typography variant="h6" gutterBottom>
                  Variants
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Manage price and quantity for each generated variant.
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ bgcolor: "grey.50" }}>
                      <TableRow>
                        {/* Create table headers from option names */}
                        {formData.options.map((opt) => (
                          <TableCell key={opt.id}>
                            {opt.name || "Option"}
                          </TableCell>
                        ))}
                        <TableCell>Quantity</TableCell>
                        <TableCell>Price</TableCell>
                        {/* Add more fields like SKU if needed */}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allCombinations.map((combo, comboIndex) => (
                        <TableRow key={comboIndex}>
                          {/* Show the value for each option */}
                          {combo.map((c, cIdx) => (
                            <TableCell key={cIdx}>{c.value}</TableCell>
                          ))}
                          {/* Inputs for quantity and price */}
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              placeholder="0"
                              value={
                                formData.generatedVariants[comboIndex]
                                  ?.quantity || ""
                              }
                              // You would need a handler to update this
                              onChange={(e) =>
                                handleVariantDetailChange(
                                  e,
                                  comboIndex,
                                  "quantity"
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              placeholder="0.00"
                              value={
                                formData.generatedVariants[comboIndex]?.price ||
                                ""
                              }
                              onChange={(e) =>
                                handleVariantDetailChange(
                                  e,
                                  comboIndex,
                                  "price"
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 items-stretch">
          {/* Specifications Container */}
          <Paper
            elevation={0}
            sx={{ border: 1, borderColor: "grey.200", p: 3 }}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Product Specifications
            </h2>
            <Box className="space-y-4">
              {formData.specifications.map((spec) => (
                <Paper
                  key={spec.id}
                  variant="outlined"
                  sx={{ p: 2, position: "relative" }}
                >
                  {/* Remove Specification Button */}
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveSpecification(spec.id)}
                    sx={{ position: "absolute", top: 20, right: 20 }}
                    disabled={formData.specifications.length === 1} // Can't remove the last one
                  >
                    <DeleteIcon />
                  </IconButton>

                  <Box sx={{ display: "flex", gap: 2, pr: 6 }}>
                    {/* Specification Name */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Specification Name"
                      placeholder="e.g., Material"
                      value={spec.name}
                      onChange={(e) =>
                        handleSpecificationChange(
                          spec.id,
                          "name",
                          e.target.value
                        )
                      }
                    />

                    {/* Specification Value */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Specification Value"
                      placeholder="e.g., Cotton"
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecificationChange(
                          spec.id,
                          "value",
                          e.target.value
                        )
                      }
                    />
                  </Box>
                </Paper>
              ))}
            </Box>

            {/* Add New Specification Button */}
            <Button
              variant="contained"
              onClick={handleAddSpecification}
              sx={{ mt: 3 }}
              startIcon={<AddIcon />}
            >
              Add Specification
            </Button>
          </Paper>

          {/* Pricing */}
          <div className="bg-white border-1 border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Pricing
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="number"
                    name="pricing.Price"
                    value={formData.pricing.Price}
                    placeholder="0.00"
                    onChange={handleChange}
                    className="sm:col-span-2 w-full border border-gray-300 rounded-lg px-3 py-2 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors && errors["pricing.Price"] && (
                    <div className="text-red-500 text-xs mt-1 sm:col-span-2">
                      {errors["pricing.Price"]}
                    </div>
                  )}
                  <FormControl fullWidth size="small">
                    {/* <InputLabel id="currency-label">Currency</InputLabel>
                    <Select
                      labelId="currency-label"
                      id="currency"
                      name="pricing.Currency"
                      value={formData.pricing.Currency}
                      label="Currency"
                      onChange={handleChange}
                    >
                      <MenuItem value="pkr">PKR</MenuItem>
                    </Select> */}
                    
                  </FormControl>
                  {errors && errors["pricing.Currency"] && (
                    <div className="text-red-500 text-xs mt-1 col-span-1">
                      {errors["pricing.Currency"]}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Availability
                </label>
                <button
                  type="button"
                  onClick={handleAvailabilityToggle} // Use the new handler
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    // Read state from formData
                    isAvailable ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      // Read state from formData
                      isAvailable ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              {errors && errors["pricing.Availability"] && (
                <div className="text-red-500 text-xs mt-1">
                  {errors["pricing.Availability"]}
                </div>
              )}
            </div>
          </div>
          {/* Organization */}
          <div className="h-fit bg-white border-1 border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Organization
            </h2>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor
                </label>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter vendor name"
                  value={formData.organization.Vendor}
                  name="organization.Vendor"
                  onChange={handleChange}
                />
                {errors && errors["organization.Vendor"] && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors["organization.Vendor"]}
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <FormControl fullWidth size="small">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    id="category"
                    value={formData.organization.Category}
                    name="organization.Category"
                    label="Category"
                    onChange={handleChange}
                  >
                    <MenuItem value="Clothing">Clothing</MenuItem>
                    <MenuItem value="Footwear">Shoes</MenuItem>
                    <MenuItem value="Electronics">Electronics</MenuItem>
                    <MenuItem value="Sports">Sports</MenuItem>
                    <MenuItem value="Accessories">Others</MenuItem>
                  </Select>
                </FormControl>
                {errors && errors["organization.Category"] && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors["organization.Category"]}
                  </div>
                )}
              </div>

              <div>
                <FormControl fullWidth size="small">
                  <InputLabel id="collection-label">Collection</InputLabel>
                  <Select
                    labelId="collection-label"
                    id="collection"
                    value={formData.organization.Collection}
                    name="organization.Collection"
                    label="Collection"
                    onChange={handleChange}
                  >
                    <MenuItem value="winter">Winter</MenuItem>
                    <MenuItem value="spring">Spring</MenuItem>
                    <MenuItem value="summer">Summer</MenuItem>
                    <MenuItem value="autumn">Autumn</MenuItem>
                  </Select>
                </FormControl>
                {errors && errors["organization.Collection"] && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors["organization.Collection"]}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <TextField
                  fullWidth
                  value={formData.organization.Tags}
                  name="organization.Tags"
                  size="small"
                  placeholder="Enter Tags here"
                  onChange={handleChange}
                />
                {errors && errors["organization.Tags"] && (
                  <div className="text-red-500 text-xs mt-1">
                    {errors["organization.Tags"]}
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
