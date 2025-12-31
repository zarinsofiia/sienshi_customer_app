// app/register.tsx
import React, { useState, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
} from "react-native";

import Input from "@/components/input/Input";
import AsyncButton from "@/components/button/AsnycButton";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../contexts/LanguageContext";
import Toast from "react-native-toast-message";
// 👇 import your MSIC JSON (update the path if needed)
import msicSubcategories from "../assets/MSICSubCategoryCodes.json";
import { API_BASE_URL } from "../config/api";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

const ORANGE = "#f59e0b";
const WHITE = "#ffffffff";

type CustomerType = "personal" | "company";

// Type for one MSIC item (based on your JSON structure)
type MsicItem = {
  Code: string;
  Description: string;
  "MSIC Category Reference": string;
};

export default function RegisterScreen() {
  const [customerType, setCustomerType] = useState<CustomerType>("personal");

  // Account fields (for both personal & company)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(
    null
  );

  // 🔹 Refs for focusing first invalid field
  const usernameRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);

  const companyNameRef = useRef<TextInput | null>(null);
  const brnNewRef = useRef<TextInput | null>(null);
  const brnOldRef = useRef<TextInput | null>(null);
  const companyTinRef = useRef<TextInput | null>(null);
  const sstNumberRef = useRef<TextInput | null>(null);
  const companyEmailRef = useRef<TextInput | null>(null);
  const companyContactRef = useRef<TextInput | null>(null);
  const personInChargeRef = useRef<TextInput | null>(null);
  const businessAddressLine1Ref = useRef<TextInput | null>(null);
  const businessCityRef = useRef<TextInput | null>(null);
  const businessStateRef = useRef<TextInput | null>(null);
  const businessCountryRef = useRef<TextInput | null>(null);
  const businessPostcodeRef = useRef<TextInput | null>(null);
  const msicSearchRef = useRef<TextInput | null>(null);

  const fullNameRef = useRef<TextInput | null>(null);
  const personalEmailRef = useRef<TextInput | null>(null);
  const personalPhoneRef = useRef<TextInput | null>(null);
  const deliveryAddressLine1Ref = useRef<TextInput | null>(null);
  const deliveryCityRef = useRef<TextInput | null>(null);
  const deliveryStateRef = useRef<TextInput | null>(null);
  const deliveryCountryRef = useRef<TextInput | null>(null);
  const deliveryPostcodeRef = useRef<TextInput | null>(null);

  // Company fields
  const [companyName, setCompanyName] = useState("");
  const [brnNew, setBrnNew] = useState("");
  const [brnOld, setBrnOld] = useState("");
  const [companyTin, setCompanyTin] = useState("");
  const [sstNumber, setSstNumber] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyContact, setCompanyContact] = useState("");

  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Person in charge
  const [personInChargeName, setPersonInChargeName] = useState("");

  // 🔹 Address split into 3 lines
  const [businessAddressLine1, setBusinessAddressLine1] = useState("");
  const [businessAddressLine2, setBusinessAddressLine2] = useState("");
  const [businessAddressLine3, setBusinessAddressLine3] = useState("");

  const [businessCity, setBusinessCity] = useState("");
  const [businessState, setBusinessState] = useState("");
  const [businessCountry, setBusinessCountry] = useState("");
  const [businessPostcode, setBusinessPostcode] = useState("");
  const [msicCode, setMsicCode] = useState("");
  const [businessActivity, setBusinessActivity] = useState("");

  const [einvoiceDate, setEinvoiceDate] = useState("");
  const [showEinvoicePicker, setShowEinvoicePicker] = useState(false);

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`; // YYYY-MM-DD
  };

  const handleEinvoiceDateChange = (
    event: DateTimePickerEvent,
    date?: Date
  ) => {
    if (event.type === "set" && date) {
      const formatted = formatDate(date);
      setEinvoiceDate(formatted);
    }
    // close picker (Android closes automatically, iOS we hide manually)
    if (Platform.OS === "android") {
      setShowEinvoicePicker(false);
    }
  };

  // 👇 State for MSIC search/select UI
  const [msicSearch, setMsicSearch] = useState("");
  const [showMsicDropdown, setShowMsicDropdown] = useState(false);

  // Personal fields
  const [fullName, setFullName] = useState("");
  const [personalPhone, setPersonalPhone] = useState("");
  const [icNumber, setIcNumber] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");

  // 🔹 Personal delivery address split into 3 lines + city/state/country/postcode
  const [deliveryAddressLine1, setDeliveryAddressLine1] = useState("");
  const [deliveryAddressLine2, setDeliveryAddressLine2] = useState("");
  const [deliveryAddressLine3, setDeliveryAddressLine3] = useState("");

  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryState, setDeliveryState] = useState("");
  const [deliveryCountry, setDeliveryCountry] = useState("");
  const [deliveryPostcode, setDeliveryPostcode] = useState("");
  const { t, lang, setLang } = useLanguage();

  // Filter MSIC options based on what user types
  const msicOptions: MsicItem[] = msicSubcategories as MsicItem[];
  const filteredMsic = msicOptions
    .filter((item) => {
      if (!msicSearch) return false;
      const q = msicSearch.toLowerCase();
      return (
        item.Code.toLowerCase().includes(q) ||
        item.Description.toLowerCase().includes(q)
      );
    })
    .slice(0, 20); // limit to 20 options for performance/UI

  const handleMsicSearchChange = (text: string) => {
    setMsicSearch(text);
    setShowMsicDropdown(true);

    // If user types an exact code, auto-fill activity too
    const exact = msicOptions.find(
      (item) => item.Code.toLowerCase() === text.trim().toLowerCase()
    );
    if (exact) {
      setMsicCode(exact.Code);
      setBusinessActivity(exact.Description);
    } else {
      // still store whatever they typed as msicCode (in case they just know the code)
      setMsicCode(text.trim());
      if (!text) {
        setBusinessActivity("");
      }
    }
  };

  const handleSelectMsic = (item: MsicItem) => {
    setMsicCode(item.Code);
    setBusinessActivity(item.Description);
    // Show both code + description in the input for clarity
    setMsicSearch(`${item.Code}`);
    setShowMsicDropdown(false);
  };

  // 🔹 Check duplicate USERNAME
  const checkUsernameDuplicate = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setUsernameError(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/check-duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmed }),
      });

      const data = await res.json().catch(() => null);
      console.log("check-duplicate username:", res.status, data);

      const msg = (data?.message || "").toString();

      // ❗ If backend returns error status with message: treat as duplicate
      if (!res.ok) {
        if (msg) {
          setUsernameError(msg); // e.g. "Username is already in use"
        } else {
          setUsernameError("Username already in use");
        }
        return;
      }

      // ✅ If 200 OK and backend sends some flag instead
      const isDuplicate =
        data?.isDuplicate ||
        data?.exists ||
        data?.duplicate ||
        data?.usernameExists;

      if (isDuplicate) {
        setUsernameError(msg || "Username already in use");
      } else {
        setUsernameError(null);
      }
    } catch (e) {
      console.log("checkUsernameDuplicate error:", e);
    }
  };

  // 🔹 Check duplicate EMAIL
  const checkEmailDuplicate = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEmailError(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/check-duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => null);
      console.log("check-duplicate email:", res.status, data);

      const msg = (data?.message || "").toString();

      if (!res.ok) {
        if (msg) {
          setEmailError(msg); // e.g. "Email is already in use"
        } else {
          setEmailError("Email already in use");
        }
        return;
      }

      const isDuplicate =
        data?.isDuplicate ||
        data?.exists ||
        data?.duplicate ||
        data?.emailExists;

      if (isDuplicate) {
        setEmailError(msg || "Email already in use");
      } else {
        setEmailError(null);
      }
    } catch (e) {
      console.log("checkEmailDuplicate error:", e);
    }
  };

  const handleRegister = async () => {
    // 🔹 Frontend validations before sending

    // 1. Password mismatch
    if (confirmPasswordError) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: confirmPasswordError,
      });
      return;
    }

    // 2. Username duplicate error (set from /api/auth/check-duplicate)
    if (usernameError) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: usernameError,
      });
      return;
    }

    // 3. Email duplicate error (set from /api/auth/check-duplicate)
    if (emailError) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: emailError,
      });
      return;
    }

    // 4. Required fields per customer type (focus first missing)
    if (customerType === "company") {
      const missing: { label: string; focus?: () => void }[] = [];

      if (!companyName.trim()) {
        missing.push({
          label: t("register_company_name_label"),
          focus: () => companyNameRef.current?.focus(),
        });
      }
      if (!brnNew.trim()) {
        missing.push({
          label: t("register_brn_new_label"),
          focus: () => brnNewRef.current?.focus(),
        });
      }
      // if (!brnOld.trim()) {
      //   missing.push({
      //     label: t("register_brn_old_label"),
      //     focus: () => brnOldRef.current?.focus(),
      //   });
      // }
      if (!companyTin.trim()) {
        missing.push({
          label: t("register_company_tin_label"),
          focus: () => companyTinRef.current?.focus(),
        });
      }
      if (!sstNumber.trim()) {
        missing.push({
          label: t("register_sst_label"),
          focus: () => sstNumberRef.current?.focus(),
        });
      }
      if (!companyEmail.trim()) {
        missing.push({
          label: t("register_company_email_label"),
          focus: () => companyEmailRef.current?.focus(),
        });
      }
      if (!companyContact.trim()) {
        missing.push({
          label: t("register_company_contact_label"),
          focus: () => companyContactRef.current?.focus(),
        });
      }
      if (!personInChargeName.trim()) {
        missing.push({
          label: t("register_pic_name_label"),
          focus: () => personInChargeRef.current?.focus(),
        });
      }
      if (!businessAddressLine1.trim()) {
        missing.push({
          label: t("register_business_address_label"),
          focus: () => businessAddressLine1Ref.current?.focus(),
        });
      }
      if (!businessCity.trim()) {
        missing.push({
          label: t("register_business_city_label"),
          focus: () => businessCityRef.current?.focus(),
        });
      }
      if (!businessState.trim()) {
        missing.push({
          label: t("register_business_state_label"),
          focus: () => businessStateRef.current?.focus(),
        });
      }
      if (!businessCountry.trim()) {
        missing.push({
          label: t("register_business_country_label"),
          focus: () => businessCountryRef.current?.focus(),
        });
      }
      if (!businessPostcode.trim()) {
        missing.push({
          label: t("register_business_postcode_label"),
          focus: () => businessPostcodeRef.current?.focus(),
        });
      }
      if (!msicCode.trim()) {
        missing.push({
          label: t("register_msic_label"),
          focus: () => msicSearchRef.current?.focus(),
        });
      }
      if (!einvoiceDate.trim()) {
        missing.push({
          label: t("register_einvoice_date_label"),
          focus: () => setShowEinvoicePicker(true),
        });
      }
      if (!username.trim()) {
        missing.push({
          label: t("register_username_label"),
          focus: () => usernameRef.current?.focus(),
        });
      }
      if (!password.trim()) {
        missing.push({
          label: t("register_password_label"),
          focus: () => passwordRef.current?.focus(),
        });
      }
      if (!confirmPassword.trim()) {
        missing.push({
          label: t("register_confirm_password_label"),
          focus: () => confirmPasswordRef.current?.focus(),
        });
      }

      if (missing.length > 0) {
        const first = missing[0];
        first.focus?.();
        Toast.show({
          type: "error",
          text1: t("register_required_title") || "Required",
          text2:
            `${first.label} ` +
            (t("register_required_suffix") || "is required."),
        });
        return;
      }
    } else {
      // PERSONAL
      const missing: { label: string; focus?: () => void }[] = [];

      if (!fullName.trim()) {
        missing.push({
          label: t("register_full_name_label"),
          focus: () => fullNameRef.current?.focus(),
        });
      }
      if (!personalEmail.trim()) {
        missing.push({
          label: t("register_personal_email_label"),
          focus: () => personalEmailRef.current?.focus(),
        });
      }
      if (!personalPhone.trim()) {
        missing.push({
          label: t("register_personal_phone_label"),
          focus: () => personalPhoneRef.current?.focus(),
        });
      }
      if (!deliveryAddressLine1.trim()) {
        missing.push({
          label: t("register_delivery_address_label"),
          focus: () => deliveryAddressLine1Ref.current?.focus(),
        });
      }
      if (!deliveryCity.trim()) {
        missing.push({
          label: t("register_delivery_city_label"),
          focus: () => deliveryCityRef.current?.focus(),
        });
      }
      if (!deliveryState.trim()) {
        missing.push({
          label: t("register_delivery_state_label"),
          focus: () => deliveryStateRef.current?.focus(),
        });
      }
      if (!deliveryCountry.trim()) {
        missing.push({
          label: t("register_delivery_country_label"),
          focus: () => deliveryCountryRef.current?.focus(),
        });
      }
      if (!deliveryPostcode.trim()) {
        missing.push({
          label: t("register_delivery_postcode_label"),
          focus: () => deliveryPostcodeRef.current?.focus(),
        });
      }
      if (!username.trim()) {
        missing.push({
          label: t("register_username_label"),
          focus: () => usernameRef.current?.focus(),
        });
      }
      if (!password.trim()) {
        missing.push({
          label: t("register_password_label"),
          focus: () => passwordRef.current?.focus(),
        });
      }
      if (!confirmPassword.trim()) {
        missing.push({
          label: t("register_confirm_password_label"),
          focus: () => confirmPasswordRef.current?.focus(),
        });
      }

      if (missing.length > 0) {
        const first = missing[0];
        first.focus?.();
        Toast.show({
          type: "error",
          text1: t("register_required_title") || "Required",
          text2:
            `${first.label} ` +
            (t("register_required_suffix") || "is required."),
        });
        return;
      }
    }

    const payload =
      customerType === "company"
        ? {
          customer_type: "company",

          company_name: companyName,
          brn_new: brnNew,
          brn_old: brnOld,
          company_tin: companyTin,
          sst_number: sstNumber,
          company_email: companyEmail,
          company_contact: companyContact,

          person_in_charge: personInChargeName,

          business_address: {
            address_line: businessAddressLine1,
            address_line_2: businessAddressLine2,
            address_line_3: businessAddressLine3,
            city: businessCity,
            state: businessState,
            country: businessCountry,
            postcode: businessPostcode,
          },

          msic_code: msicCode,
          business_activity: businessActivity,
          e_invoice_implementation_date: einvoiceDate,

          language: lang,
          username,
          password,
          confirm_password: confirmPassword,
        }
        : {
          customer_type: "personal",
          full_name: fullName,
          phone: personalPhone,
          ic_number: icNumber,
          passport_number: passportNumber,
          delivery_address: {
            address_line: deliveryAddressLine1,
            address_line_2: deliveryAddressLine2,
            address_line_3: deliveryAddressLine3,
            city: deliveryCity,
            state: deliveryState,
            country: deliveryCountry,
            postcode: deliveryPostcode,
          },

          language: lang,
          username,
          password,
          confirm_password: confirmPassword,
          personal_email: personalEmail,
        };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });


      const data = await res.json().catch(() => null);

      console.log("status:", res.status, "body:", data);

      if (!res.ok) {
        // ❌ Error from backend
        const msg =
          data?.message || t("register_error") || "Registration failed.";

        Toast.show({
          type: "error",
          text1: "Error",
          text2: msg,
        });

        return;
      }

      // ✅ Success
      const msg =
        data?.message || t("register_success") || "Registration successful.";

      Toast.show({
        type: "success",
        text1: "Success",
        text2: msg,
      });

      // optional: small delay so user can see toast before navigation
      setTimeout(() => {
        router.replace("/register-success");
      }, 800);
    } catch (error) {
      console.log("Request error:", error);

      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          t("register_error") || "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ScrollView wraps the whole orange header + white panel */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.container}>
            {/* Top orange header */}
            <View style={styles.header}>
              <Text style={styles.headerText}>{t("register_title")}</Text>
            </View>

            {/* White rounded panel */}
            <View style={styles.panel}>
              <View style={styles.panelContent}>
                {/* CUSTOMER TYPE SECTION */}
                <View style={[styles.fieldGroup, { marginTop: 8 }]}>
                  <Text style={styles.label}>
                    {t("register_customer_type_label")}
                  </Text>
                  <View style={styles.typeToggleRow}>
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        customerType === "personal" && styles.typeButtonActive,
                      ]}
                      onPress={() => setCustomerType("personal")}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          customerType === "personal" &&
                          styles.typeButtonTextActive,
                        ]}
                      >
                        {t("register_customer_type_personal")}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        customerType === "company" && styles.typeButtonActive,
                      ]}
                      onPress={() => setCustomerType("company")}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          customerType === "company" &&
                          styles.typeButtonTextActive,
                        ]}
                      >
                        {t("register_customer_type_company")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* COMPANY FIELDS */}
                {customerType === "company" && (
                  <>
                    {/* Company Name */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={companyNameRef}
                        label={t("register_company_name_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_company_name_placeholder")}
                        placeholderTextColor="#9ca3af"
                        value={companyName}
                        onChangeText={setCompanyName}
                        uiSize="md"
                        leftIcon={
                          <Ionicons
                            name="business-outline"
                            size={16}
                            color="#9ca3af"
                          />
                        }
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                    </View>

                    {/* BRN New */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={brnNewRef}
                        labelStyle={styles.label}
                        label={t("register_brn_new_label")}
                        placeholder={t("register_brn_new_placeholder")}
                        placeholderTextColor="#9ca3af"
                        value={brnNew}
                        onChangeText={setBrnNew}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                    </View>

                    {/* BRN Old */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={brnOldRef}
                        label={t("register_brn_old_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_brn_old_placeholder")}
                        placeholderTextColor="#9ca3af"
                        value={brnOld}
                        onChangeText={setBrnOld}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: false }}
                        showValidation={false}
                      />
                    </View>

                    {/* Company TIN */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={companyTinRef}
                        label={t("register_company_tin_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_company_tin_placeholder")}
                        placeholderTextColor="#9ca3af"
                        value={companyTin}
                        onChangeText={setCompanyTin}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                    </View>

                    {/* SST Number */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={sstNumberRef}
                        label={t("register_sst_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_sst_placeholder")}
                        placeholderTextColor="#9ca3af"
                        value={sstNumber}
                        onChangeText={setSstNumber}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                    </View>

                    {/* Company Email */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={companyEmailRef}
                        label={t("register_company_email_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_company_email_placeholder")}
                        placeholderTextColor="#9ca3af"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={companyEmail}
                        onChangeText={(text) => {
                          setCompanyEmail(text);
                          setEmailError(null);
                        }}
                        onBlur={() => {
                          if (
                            customerType === "company" &&
                            companyEmail.trim()
                          ) {
                            checkEmailDuplicate(companyEmail);
                          }
                        }}
                        uiSize="md"
                        leftIcon={
                          <Ionicons
                            name="mail-outline"
                            size={16}
                            color="#9ca3af"
                          />
                        }
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                      {customerType === "company" && emailError && (
                        <Text style={styles.passwordErrorText}>
                          {emailError}
                        </Text>
                      )}
                    </View>

                    {/* Company Contact (digits only, number pad) */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={companyContactRef}
                        label={t("register_company_contact_label")}
                        labelStyle={styles.label}
                        placeholder={t(
                          "register_company_contact_placeholder"
                        )}
                        placeholderTextColor="#9ca3af"
                        value={companyContact}
                        onChangeText={(text) => {
                          const onlyDigits = text.replace(/[^0-9]/g, "");
                          setCompanyContact(onlyDigits);
                        }}
                        keyboardType="number-pad"
                        uiSize="md"
                        leftIcon={
                          <Ionicons
                            name="call-outline"
                            size={16}
                            color="#9ca3af"
                          />
                        }
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                    </View>

                    {/* Person in Charge */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={personInChargeRef}
                        label={t("register_pic_name_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_pic_name_placeholder")}
                        placeholderTextColor="#9ca3af"
                        value={personInChargeName}
                        onChangeText={setPersonInChargeName}
                        uiSize="md"
                        leftIcon={
                          <Ionicons
                            name="person-circle-outline"
                            size={16}
                            color="#9ca3af"
                          />
                        }
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                    </View>

                    {/* 🔹 Business Address: 3 lines */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Text style={styles.label}>
                        {t("register_business_address_label")}
                        <Text style={{ color: "#ef4444" }}> *</Text>
                      </Text>

                      <Input
                        ref={businessAddressLine1Ref}
                        placeholder={t(
                          "register_business_address_line1_placeholder"
                        )}
                        placeholderTextColor="#9ca3af"
                        value={businessAddressLine1}
                        onChangeText={setBusinessAddressLine1}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />

                      <Input
                        placeholder={t(
                          "register_business_address_line2_placeholder"
                        )}
                        placeholderTextColor="#9ca3af"
                        value={businessAddressLine2}
                        onChangeText={setBusinessAddressLine2}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                      />

                      <Input
                        placeholder={t(
                          "register_business_address_line3_placeholder"
                        )}
                        placeholderTextColor="#9ca3af"
                        value={businessAddressLine3}
                        onChangeText={setBusinessAddressLine3}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                      />
                    </View>

                    {/* City + State */}
                    <View style={styles.row}>
                      <View style={[styles.fieldGroup, { flex: 1 }]}>
                        <Input
                          ref={businessCityRef}
                          label={t("register_business_city_label")}
                          labelStyle={styles.label}
                          placeholder={t(
                            "register_business_city_placeholder"
                          )}
                          placeholderTextColor="#9ca3af"
                          value={businessCity}
                          onChangeText={(text) => {
                            const onlyLetters = text.replace(
                              /[^A-Za-z\s]/g,
                              ""
                            );
                            setBusinessCity(onlyLetters);
                          }}
                          uiSize="md"
                          containerStyle={styles.inputWrapper}
                          inputStyle={styles.input}
                          validationRules={{ required: true }}
                          showValidation={false}
                        />
                      </View>

                      <View
                        style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}
                      >
                        <Input
                          ref={businessStateRef}
                          label={t("register_business_state_label")}
                          labelStyle={styles.label}
                          placeholder={t(
                            "register_business_state_placeholder"
                          )}
                          placeholderTextColor="#9ca3af"
                          value={businessState}
                          onChangeText={(text) => {
                            const onlyLetters = text.replace(
                              /[^A-Za-z\s]/g,
                              ""
                            );
                            setBusinessState(onlyLetters);
                          }}
                          uiSize="md"
                          containerStyle={styles.inputWrapper}
                          inputStyle={styles.input}
                          validationRules={{ required: true }}
                          showValidation={false}
                        />
                      </View>
                    </View>

                    {/* Country + Postcode */}
                    <View style={styles.row}>
                      <View style={[styles.fieldGroup, { flex: 1 }]}>
                        <Input
                          ref={businessCountryRef}
                          label={t("register_business_country_label")}
                          labelStyle={styles.label}
                          placeholder={t(
                            "register_business_country_placeholder"
                          )}
                          placeholderTextColor="#9ca3af"
                          value={businessCountry}
                          onChangeText={(text) => {
                            const onlyLetters = text.replace(
                              /[^A-Za-z\s]/g,
                              ""
                            );
                            setBusinessCountry(onlyLetters);
                          }}
                          uiSize="md"
                          containerStyle={styles.inputWrapper}
                          inputStyle={styles.input}
                          validationRules={{ required: true }}
                          showValidation={false}
                        />
                      </View>

                      <View
                        style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}
                      >
                        <Input
                          ref={businessPostcodeRef}
                          label={t("register_business_postcode_label")}
                          labelStyle={styles.label}
                          placeholder={t(
                            "register_business_postcode_placeholder"
                          )}
                          placeholderTextColor="#9ca3af"
                          keyboardType="number-pad"
                          value={businessPostcode}
                          onChangeText={(text) => {
                            const digitsOnly = text.replace(/[^0-9]/g, "");
                            setBusinessPostcode(digitsOnly);
                          }}
                          uiSize="md"
                          containerStyle={styles.inputWrapper}
                          inputStyle={styles.input}
                          validationRules={{ required: true }}
                          showValidation={false}
                        />
                      </View>
                    </View>

                    {/* MSIC search & select */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={msicSearchRef}
                        label={t("register_msic_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_msic_placeholder")}
                        placeholderTextColor="#9ca3af"
                        value={msicSearch}
                        onChangeText={handleMsicSearchChange}
                        onFocus={() => setShowMsicDropdown(true)}
                        uiSize="md"
                        leftIcon={
                          <Ionicons
                            name="search-outline"
                            size={16}
                            color="#9ca3af"
                          />
                        }
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />

                      {showMsicDropdown && filteredMsic.length > 0 && (
                        <View style={styles.msicDropdown}>
                          <ScrollView keyboardShouldPersistTaps="handled">
                            {filteredMsic.map((item) => (
                              <TouchableOpacity
                                key={item.Code}
                                style={styles.msicOption}
                                onPress={() => handleSelectMsic(item)}
                              >
                                <Text style={styles.msicCodeText}>
                                  {item.Code}
                                </Text>
                                <Text style={styles.msicDescText}>
                                  {item.Description}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                    </View>

                    {/* Business Activity (read-only, multiline) */}
                    <View
                      style={[
                        styles.fieldGroup,
                        { marginTop: 16, marginBottom: 8 },
                      ]}
                    >
                      <Input
                        label={t("register_business_activity_label")}
                        labelStyle={styles.label}
                        placeholder={t(
                          "register_business_activity_placeholder"
                        )}
                        placeholderTextColor="#9ca3af"
                        value={businessActivity}
                        multiline
                        editable={false} // auto-filled from MSIC
                        uiSize="md"
                        containerStyle={[styles.inputWrapper, { height: 80 }]}
                        inputStyle={[styles.input, { height: 80 }]}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                    </View>

                    {/* E-invoice date */}
                    <View
                      style={[
                        styles.fieldGroup,
                        { marginTop: 8, marginBottom: 8 },
                      ]}
                    >
                      <Text style={styles.label}>
                        {t("register_einvoice_date_label")}
                        <Text style={{ color: "#ef4444" }}> *</Text>
                      </Text>
                      <View style={styles.inputWrapper}>
                        <Ionicons
                          name="calendar-outline"
                          size={16}
                          color="#9ca3af"
                        />

                        {/* Tap area to open date picker */}
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => setShowEinvoicePicker(true)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.input,
                              {
                                textAlignVertical: "center",
                                paddingVertical: 8,
                                marginLeft: 8,
                              },
                            ]}
                          >
                            {einvoiceDate ||
                              t("register_einvoice_date_placeholder")}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {showEinvoicePicker && (
                        <DateTimePicker
                          value={
                            einvoiceDate ? new Date(einvoiceDate) : new Date()
                          }
                          mode="date"
                          display={
                            Platform.OS === "ios" ? "spinner" : "default"
                          }
                          onChange={handleEinvoiceDateChange}
                        />
                      )}
                    </View>
                  </>
                )}

                {/* PERSONAL FIELDS */}
                {customerType === "personal" && (
                  <>
                    {/* Full name */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={fullNameRef}
                        label={t("register_full_name_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_full_name_placeholder")}
                        placeholderTextColor="#9ca3af"
                        value={fullName}
                        onChangeText={setFullName}
                        uiSize="md"
                        leftIcon={
                          <Ionicons
                            name="person-outline"
                            size={16}
                            color="#9ca3af"
                          />
                        }
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                    </View>

                    {/* Personal Email */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={personalEmailRef}
                        label={t("register_personal_email_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_personal_email_placeholder")}
                        placeholderTextColor="#9ca3af"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={personalEmail}
                        onChangeText={(text) => {
                          setPersonalEmail(text);
                          setEmailError(null);
                        }}
                        onBlur={() => {
                          if (
                            customerType === "personal" &&
                            personalEmail.trim()
                          ) {
                            checkEmailDuplicate(personalEmail);
                          }
                        }}
                        uiSize="md"
                        leftIcon={
                          <Ionicons
                            name="person-outline"
                            size={16}
                            color="#9ca3af"
                          />
                        }
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                      {customerType === "personal" && emailError && (
                        <Text style={styles.passwordErrorText}>
                          {emailError}
                        </Text>
                      )}
                    </View>

                    {/* Personal phone (digits only) */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        ref={personalPhoneRef}
                        label={t("register_personal_phone_label")}
                        labelStyle={styles.label}
                        placeholder={t(
                          "register_personal_phone_placeholder"
                        )}
                        placeholderTextColor="#9ca3af"
                        keyboardType="phone-pad"
                        value={personalPhone}
                        onChangeText={(text) => {
                          const digitsOnly = text.replace(/[^0-9]/g, "");
                          setPersonalPhone(digitsOnly);
                        }}
                        uiSize="md"
                        leftIcon={
                          <Ionicons
                            name="call-outline"
                            size={16}
                            color="#9ca3af"
                          />
                        }
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                        validationRules={{ required: true }}
                        showValidation={false}
                      />
                    </View>

                    {/* IC Number */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        label={t("register_ic_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_ic_placeholder")}
                        placeholderTextColor="#9ca3af"
                        keyboardType="number-pad"
                        value={icNumber}
                        onChangeText={(text) => {
                          const digitsOnly = text.replace(/[^0-9]/g, "");
                          setIcNumber(digitsOnly);
                        }}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                      />
                    </View>

                    {/* Passport Number */}
                    <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                      <Input
                        label={t("register_passport_label")}
                        labelStyle={styles.label}
                        placeholder={t("register_passport_placeholder")}
                        placeholderTextColor="#9ca3af"
                        value={passportNumber}
                        onChangeText={setPassportNumber}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                      />
                    </View>

                    {/* Delivery address 3 lines */}
                    <View
                      style={[
                        styles.fieldGroup,
                        { marginTop: 16, marginBottom: 8 },
                      ]}
                    >
                      <Text style={styles.label}>
                        {t("register_delivery_address_label")}
                        <Text style={{ color: "#ef4444" }}> *</Text>
                      </Text>

                      <Input
                        ref={deliveryAddressLine1Ref}
                        placeholder={t(
                          "register_delivery_address_line1_placeholder"
                        )}
                        placeholderTextColor="#9ca3af"
                        value={deliveryAddressLine1}
                        onChangeText={setDeliveryAddressLine1}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                      />

                      <Input
                        placeholder={t(
                          "register_delivery_address_line2_placeholder"
                        )}
                        placeholderTextColor="#9ca3af"
                        value={deliveryAddressLine2}
                        onChangeText={setDeliveryAddressLine2}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                      />

                      <Input
                        placeholder={t(
                          "register_delivery_address_line3_placeholder"
                        )}
                        placeholderTextColor="#9ca3af"
                        value={deliveryAddressLine3}
                        onChangeText={setDeliveryAddressLine3}
                        uiSize="md"
                        containerStyle={styles.inputWrapper}
                        inputStyle={styles.input}
                      />
                    </View>

                    {/* City + State */}
                    <View style={styles.row}>
                      <View style={[styles.fieldGroup, { flex: 1 }]}>
                        <Input
                          ref={deliveryCityRef}
                          label={t("register_delivery_city_label")}
                          labelStyle={styles.label}
                          placeholder={t("register_delivery_city_placeholder")}
                          placeholderTextColor="#9ca3af"
                          value={deliveryCity}
                          onChangeText={(text) => {
                            const onlyLetters = text.replace(
                              /[^A-Za-z\s]/g,
                              ""
                            );
                            setDeliveryCity(onlyLetters);
                          }}
                          uiSize="md"
                          containerStyle={styles.inputWrapper}
                          inputStyle={styles.input}
                          validationRules={{ required: true }}
                          showValidation={false}
                        />
                      </View>

                      <View
                        style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}
                      >
                        <Input
                          ref={deliveryStateRef}
                          label={t("register_delivery_state_label")}
                          labelStyle={styles.label}
                          placeholder={t(
                            "register_delivery_state_placeholder"
                          )}
                          placeholderTextColor="#9ca3af"
                          value={deliveryState}
                          onChangeText={(text) => {
                            const onlyLetters = text.replace(
                              /[^A-Za-z\s]/g,
                              ""
                            );
                            setDeliveryState(onlyLetters);
                          }}
                          uiSize="md"
                          containerStyle={styles.inputWrapper}
                          inputStyle={styles.input}
                          validationRules={{ required: true }}
                          showValidation={false}
                        />
                      </View>
                    </View>

                    {/* Country + Postcode */}
                    <View style={styles.row}>
                      <View style={[styles.fieldGroup, { flex: 1 }]}>
                        <Input
                          ref={deliveryCountryRef}
                          label={t("register_delivery_country_label")}
                          labelStyle={styles.label}
                          placeholder={t(
                            "register_delivery_country_placeholder"
                          )}
                          placeholderTextColor="#9ca3af"
                          value={deliveryCountry}
                          onChangeText={(text) => {
                            const onlyLetters = text.replace(
                              /[^A-Za-z\s]/g,
                              ""
                            );
                            setDeliveryCountry(onlyLetters);
                          }}
                          uiSize="md"
                          containerStyle={styles.inputWrapper}
                          inputStyle={styles.input}
                          validationRules={{ required: true }}
                          showValidation={false}
                        />
                      </View>

                      <View
                        style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}
                      >
                        <Input
                          ref={deliveryPostcodeRef}
                          label={t("register_delivery_postcode_label")}
                          labelStyle={styles.label}
                          placeholder={t(
                            "register_delivery_postcode_placeholder"
                          )}
                          placeholderTextColor="#9ca3af"
                          keyboardType="number-pad"
                          value={deliveryPostcode}
                          onChangeText={(text) => {
                            const digitsOnly = text.replace(/[^0-9]/g, "");
                            setDeliveryPostcode(digitsOnly);
                          }}
                          uiSize="md"
                          containerStyle={styles.inputWrapper}
                          inputStyle={styles.input}
                          validationRules={{ required: true }}
                          showValidation={false}
                        />
                      </View>
                    </View>
                  </>
                )}

                {/* ACCOUNT LOGIN FIELDS – common for both customer types */}
                <View style={[styles.fieldGroup, { marginTop: 24 }]}>
                  <Text style={styles.label}>
                    {t("register_account_section_label")}
                  </Text>

                  {/* Username */}
                  <Input
                    ref={usernameRef}
                    label={t("register_username_label")}
                    labelStyle={styles.label}
                    placeholder={t("register_username_placeholder")}
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setUsernameError(null); // clear while typing
                    }}
                    onBlur={() => {
                      if (username.trim()) {
                        checkUsernameDuplicate(username);
                      }
                    }}
                    uiSize="md"
                    leftIcon={
                      <Ionicons
                        name="person-circle-outline"
                        size={16}
                        color="#9ca3af"
                      />
                    }
                    containerStyle={styles.inputWrapper}
                    inputStyle={styles.input}
                    validationRules={{ required: true }}
                    showValidation={false}
                  />

                  {usernameError && (
                    <Text style={styles.passwordErrorText}>
                      {usernameError}
                    </Text>
                  )}

                  {/* Password */}
                  <View style={{ marginTop: 16 }}>
                    <Input
                      ref={passwordRef}
                      label={t("register_password_label")}
                      labelStyle={styles.label}
                      placeholder={t("register_password_placeholder")}
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      autoCapitalize="none"
                      value={password}
                      onChangeText={setPassword}
                      uiSize="md"
                      leftIcon={
                        <Ionicons
                          name="lock-closed-outline"
                          size={16}
                          color="#9ca3af"
                        />
                      }
                      containerStyle={styles.inputWrapper}
                      inputStyle={styles.input}
                      validationRules={{ required: true }}
                      showValidation={false}
                    />
                  </View>

                  {/* Confirm Password */}
                  <View style={{ marginTop: 16 }}>
                    <Input
                      ref={confirmPasswordRef}
                      label={t("register_confirm_password_label")}
                      labelStyle={styles.label}
                      placeholder={t("register_confirm_password_placeholder")}
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      autoCapitalize="none"
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);

                        // 🔹 frontend validation while typing
                        if (!text || !password) {
                          // if either is empty, don't show error yet
                          setConfirmPasswordError(null);
                          return;
                        }

                        if (text !== password) {
                          setConfirmPasswordError("Passwords do not match");
                        } else {
                          setConfirmPasswordError(null);
                        }
                      }}
                      uiSize="md"
                      leftIcon={
                        <Ionicons
                          name="lock-closed-outline"
                          size={16}
                          color="#9ca3af"
                        />
                      }
                      containerStyle={styles.inputWrapper}
                      inputStyle={styles.input}
                      validationRules={{ required: true }}
                      showValidation={false}
                    />

                    {/* 🔹 show error text manually, outside Input */}
                    {confirmPasswordError && (
                      <Text style={styles.passwordErrorText}>
                        {confirmPasswordError}
                      </Text>
                    )}
                  </View>
                </View>

                <AsyncButton
                  onPress={handleRegister}
                  variant="primary"
                  size="md"
                  fullWidth
                  style={styles.registerButton}
                  textStyle={styles.registerButtonText}
                >
                  {t("register_button")}
                </AsyncButton>

                {/* Already have account */}
                <View style={styles.loginRow}>
                  <Text style={styles.loginText}>
                    {t("register_have_account")}{" "}
                  </Text>
                  <TouchableOpacity onPress={() => router.replace("/login")}>
                    <Text style={styles.loginLink}>{t("register_login")}</Text>
                  </TouchableOpacity>
                </View>

                {/* Language toggle */}
                <View style={styles.langRow}>
                  <TouchableOpacity onPress={() => setLang("en")}>
                    <Text
                      style={[
                        styles.langText,
                        lang === "en" && styles.langActive,
                      ]}
                    >
                      EN
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.langSeparator}> | </Text>

                  <TouchableOpacity onPress={() => setLang("zh")}>
                    <Text
                      style={[
                        styles.langText,
                        lang === "zh" && styles.langActive,
                      ]}
                    >
                      中
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: ORANGE,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontFamily: "Karla-ExtraBold",
    fontWeight: "900",
    color: "#ffffff",
  },
  panel: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 45,
    overflow: "hidden",
  },
  panelContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  fieldGroup: {
    marginTop: 0,
  },
  label: {
    fontSize: 12,
    fontFamily: "Karla-ExtraBold",
    fontWeight: "900",
    color: ORANGE,
    letterSpacing: 0.8,
    marginTop: 15,
  },
  inputWrapper: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 12,
    color: "#111827",
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeToggleRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    alignItems: "center",
    marginRight: 8,
  },
  typeButtonActive: {
    borderColor: ORANGE,
    backgroundColor: "#fef3c7",
  },
  typeButtonText: {
    fontSize: 13,
    color: "#6b7280",
    fontFamily: "Karla-ExtraBold",
  },
  typeButtonTextActive: {
    color: ORANGE,
    fontFamily: "Karla-ExtraBold",
  },
  registerButton: {
    marginTop: 28,
    backgroundColor: ORANGE,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  registerButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.8,
  },
  loginRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 12,
    color: "#6b7280",
  },
  loginLink: {
    fontSize: 12,
    color: ORANGE,
    fontWeight: "700",
  },
  langRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  langText: {
    fontSize: 12,
    color: "#9ca3af",
    fontFamily: "Karla-ExtraBold",
  },
  langActive: {
    color: ORANGE,
    fontFamily: "Karla-ExtraBold",
  },
  langSeparator: {
    fontSize: 12,
    color: "#9ca3af",
    marginHorizontal: 6,
  },

  // extra styles for MSIC dropdown
  msicDropdown: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    maxHeight: 200,
    overflow: "hidden",
  },
  msicOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  msicCodeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  msicDescText: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
  },
  passwordErrorText: {
    marginTop: 4,
    fontSize: 12,
    color: "#dc2626",
  },
});
