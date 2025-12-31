// locales/en.ts

// Core English translation object
const en = {
  /* =========================================================================
   * LOGIN
   * ========================================================================= */
  login_hello: "Hello,",
  login_welcome_back: "Welcome Back !",

  // Login form labels
  login_username_label: "USERNAME",
  login_password_label: "PASSWORD",

  // Login actions / links
  login_forgot: "Forgot password ?",
  login_button: "LOG IN",
  login_no_account: "Don’t have an account?",
  login_register: "Register",

  // Login placeholders
  login_username_placeholder: "Enter your username",
  login_password_placeholder: "Enter your password",

  // Login messages
  login_missing_fields: "Please enter username and password.",
  login_error: "Login failed. Please check your username and password.",
  login_success: "You have logged in successfully.",
  login_success_title: "Success",

  /* =========================================================================
   * REGISTER – GENERAL
   * ========================================================================= */
  register_title: "Register Account",

  // Basic button / link text
  register_button: "REGISTER",
  register_have_account: "Already have an account?",
  register_login: "Login",

  // Validation messages
  register_required_message: "Please fill in all required fields.",
  register_required_title: "Required",
  register_required_suffix: "is required",

  /* =========================================================================
   * REGISTER – CUSTOMER TYPE
   * ========================================================================= */
  register_customer_type_label: "CUSTOMER TYPE",
  register_customer_type_personal: "Personal",
  register_customer_type_company: "Company",

  /* =========================================================================
   * REGISTER – COMPANY DETAILS
   * ========================================================================= */
  register_company_name_label: "COMPANY NAME",
  register_company_name_placeholder: "Enter company name",

  register_brn_new_label: "BRN (NEW)",
  register_brn_new_placeholder: "Enter new BRN",

  register_brn_old_label: "BRN (OLD)",
  register_brn_old_placeholder: "Enter old BRN",

  register_company_tin_label: "COMPANY TIN",
  register_company_tin_placeholder: "Enter company TIN",

  register_sst_label: "SST NUMBER",
  register_sst_placeholder: "Enter SST number",

  register_company_email_label: "EMAIL ADDRESS",
  register_company_email_placeholder: "Enter company email",

  register_company_contact_label: "CONTACT",
  register_company_contact_placeholder: "Enter contact number",

  /* -------------------------------------------------------------------------
   * REGISTER – BUSINESS ADDRESS (COMPANY)
   * ------------------------------------------------------------------------- */
  register_business_address_label: "BUSINESS ADDRESS",

  // Address lines
  register_business_address_line1_placeholder: "Address line 1 (street, building)",
  register_business_address_line2_placeholder: "Address line 2 (unit, floor, block)",
  register_business_address_line3_placeholder: "Address line 3 (area, district, etc.)",

  // City / state / country / postcode
  register_business_city_label: "CITY",
  register_business_city_placeholder: "Enter city",

  register_business_state_label: "STATE",
  register_business_state_placeholder: "Enter state",

  register_business_country_label: "COUNTRY",
  register_business_country_placeholder: "Enter country",

  register_business_postcode_label: "POSTCODE",
  register_business_postcode_placeholder: "Enter postcode",

  // Business info
  register_msic_label: "MSIC CODE",
  register_msic_placeholder: "Enter MSIC code",

  register_business_activity_label: "BUSINESS ACTIVITY DESCRIPTION",
  register_business_activity_placeholder: "Describe main business activity",

  /* =========================================================================
   * REGISTER – PERSONAL DETAILS
   * ========================================================================= */
  register_full_name_label: "FULL NAME",
  register_full_name_placeholder: "Enter full name",

  register_personal_phone_label: "PHONE NUMBER",
  register_personal_phone_placeholder: "Enter phone number",

  register_ic_label: "IC NUMBER",
  register_ic_placeholder: "Enter IC number",

  register_passport_label: "PASSPORT NUMBER",
  register_passport_placeholder: "Enter passport number",

  register_personal_email_label: "EMAIL ADDRESS",
  register_personal_email_placeholder: "Enter email address",

  /* -------------------------------------------------------------------------
   * REGISTER – DELIVERY ADDRESS (PERSONAL)
   * ------------------------------------------------------------------------- */
  register_delivery_address_label: "DELIVERY ADDRESS",

  // Address lines
  register_delivery_address_line1_placeholder: "Address line 1 (street, building)",
  register_delivery_address_line2_placeholder: "Address line 2 (unit, floor, block)",
  register_delivery_address_line3_placeholder: "Address line 3 (area, district, etc.)",

  // City / state / country / postcode
  register_delivery_city_label: "CITY",
  register_delivery_city_placeholder: "Enter city",

  register_delivery_state_label: "STATE",
  register_delivery_state_placeholder: "Enter state",

  register_delivery_country_label: "COUNTRY",
  register_delivery_country_placeholder: "Enter country",

  register_delivery_postcode_label: "POSTCODE",
  register_delivery_postcode_placeholder: "Enter postcode",

  /* =========================================================================
   * REGISTER – PERSON IN CHARGE (PIC)
   * ========================================================================= */
  register_pic_name_label: "PERSON IN CHARGE NAME",
  register_pic_name_placeholder: "Enter person in charge name",

  register_pic_phone_label: "PERSON IN CHARGE PHONE",
  register_pic_phone_placeholder: "Enter person in charge phone number",

  /* =========================================================================
   * REGISTER – E-INVOICE
   * ========================================================================= */
  register_einvoice_date_label: "E-INVOICE IMPLEMENTATION DATE",
  register_einvoice_date_placeholder: "YYYY-MM-DD",

  /* =========================================================================
   * REGISTER – ACCOUNT LOGIN FIELDS
   * ========================================================================= */
  register_account_section_label: "ACCOUNT LOGIN DETAILS",

  register_username_label: "USERNAME",
  register_username_placeholder: "Enter username",

  register_password_label: "PASSWORD",
  register_password_placeholder: "Enter password",

  register_confirm_password_label: "CONFIRM PASSWORD",
  register_confirm_password_placeholder: "Re-enter password",

  /* =========================================================================
   * REGISTER – STATUS MESSAGES
   * ========================================================================= */
  register_success: "Registration successful!",
  register_error: "Registration failed. Please try again.",

  register_success_title: "Application submitted",
  register_success_message:
    "Your application has been sent. Please wait for Sien Shi to review your application.",
  register_success_back_to_login: "Return to login page",
  register_success_emergency: "If this is urgent, please contact Sien Shi support.",

  /* =========================================================================
   * NAVIGATION TABS
   * ========================================================================= */
  tab_home: "Home",
  tab_menu: "Menu",
  tab_parcel: "Parcel",
  tab_tracking: "Tracking",
  tab_me: "Me",

  /* =========================================================================
   * HEADERS
   * ========================================================================= */
  header_dashboard: "Dashboard",
  header_menu: "Menu",
  header_tracking: "Tracking",
  header_parcel: "Parcel",
  header_me: "My Profile",


  me_profile: "Edit Profile Information",
  me_change_password: "Change Password",
  me_settings: "Settings",
  me_header_pill: "My Account",

  // SETTINGS
settings_title: "Settings",
settings_notifications: "Notifications",
settings_notifications_desc: "Enable push notifications",
settings_dark_mode: "Dark Mode",
settings_dark_mode_desc: "Use dark theme",
settings_language: "Language",
settings_language_desc: "Change app language",


settings_success_title: "Success",
settings_error_title: "Error",
settings_lang_set_en: "Language set to English",
settings_lang_set_zh: "Language set to Chinese",
settings_lang_change_failed: "Failed to change language",
common_ok: 'OK',

dashboard_welcome_title: "Welcome, {name}!",
dashboard_guest: "Guest",
dashboard_welcome_subtitle: "Track your shipment",

dashboard_services: "Services",
dashboard_track_parcel: "Track Parcel",
dashboard_shipment_list: "Shipment List",
dashboard_recent: "Recent",

};

export default en;

// Optional: export type for keys, can be reused elsewhere if needed
export type EnTranslationKey = keyof typeof en;
