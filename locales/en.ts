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
  header_calculator: "Calculator",
  header_shipment: "Shipment",


  me_profile: "Edit Profile Information",
  me_change_password: "Change Password",
  me_settings: "Settings",
  me_header_pill: "My Account",
  me_login_required: "Login to access your account settings.",
  me_login_required_sub: "Login to manage your account",

  me_profile_sub: "Name · Email · Phone and more",
  me_change_password_sub: "Click to change password",


  login: "Login",
  edit: "Edit",
  loading: "Loading...",
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
  dashboard_announcement: "Announcement",
  dashboard_no_announcement_title: "No announcements yet",
  dashboard_no_announcement_sub: "Updates from our team will appear here.",

  dashboard_search_placeholder: "Enter Tracking No",

  dashboard_calculator: "Calculator",



  //tracking page
  tracking_title: "Tracking",
  tracking_subtitle: "Track your parcel",
  tracking_search_placeholder: "Search",
  tracking_no_parcels: "No Parcels",
  tracking_login_prompt: "Login to see all parcels",
  tracking_login_button: "Login",
  tracking_loading: "Loading...",
  tracking_searching: "Searching",
  tracking_search_result: "Search Results",





  //shipment
  shipment_title: "Shipment",
  shipment_subtitle: "View all your parcels",
  shipment_search_placeholder: "Search",
  shipment_searching: "Searching...",
  shipment_search_result: "Search Results",
  shipment_loading: "Loading...",
  shipment_login_prompt: "Login to see all parcels",
  shipment_no_parcels: "No Parcels",
  shipment_login_button: "Login",
  shipment_total_weight: "Total Weight (kg)",
  shipment_volume: "Volume (m³) ",

  //detail page
  header_tracking_detail: "Tracking Detail",
  td_tracking_id: "Tracking No",
  td_current_status: "Current Status",
  td_last_update: "Last Update",
  td_title: "Track Parcel",
  td_loading: "Loading",
  td_no_timeline: "No timeline yet",
  td_remarks: "Remarks",

  tracking_status_cn_warehouse: "Parcel at China Warehouse",
  tracking_status_on_declaration: "Declaration in Progress",
  tracking_status_in_shipment: "Shipping in Progress",
  tracking_status_container_packed: "Container Packed",
  tracking_status_arrived_at_port: "Arrived at Port",
  tracking_status_my_customs_inspection_kch: "Inspection in Kuching",
  tracking_status_customs_clearance_in_progress: "Customs Clearance in Progress",
  tracking_status_kch_custom: "Kuching Customs",
  tracking_status_kch_warehouse: "Arrived at Kuching Warehouse",
  tracking_status_out_for_delivery: "Out for Delivery",
  tracking_status_delivered: "Delivered",
  tracking_status_cn_customs_clearance: "Customs Clearance (China)",
  tracking_status_cn_customs_inspection: "Inspection in China",
  //calculator
  calc_title: "Parcel Calculator",
  calc_subtitle: " Enter size (cm) & weight (kg). Volume (m³) will be calculated automatically.",
  calc_length: "Length (cm)",
  calc_width: "Width (cm)",
  calc_height: "Height (cm)",
  calc_volume: "Volume (m³)",
  calc_weight: "Weight (kg)",
  calc_calculate_button: "Calculate",
  calc_reset_button: "Reset",
  calc_result_section: "Result",
  calc_total_price: "Total Price",
  calc_ok_label: "OK",

  //shipment detail page
  sd_tracking_id: "Tracking ID",
  sd_current_status: "Current Status",
  sd_loading: "Loading",
  sd_no_timeline: "No timeline yet",
  sd_remarks: "Remarks",

  //announcement 
  announcement_loading: "Loading",
  announcement_not_found: "Announcement not found",
  announcement_try_again: "Please try again later",

  //me
  me_delivery_address: 'Delivery Address',
  copy: "Copy",
  ok: "Ok",
  me_no_address_title: 'No Address',
  me_delivery_address_empty: "Delivery address is empty",
  me_copied: 'Copied',
  me_copied_message: 'Delivery address copied to clipboard',
  me_error: "Error",
  me_error_message: "Failed to copy address",
  me_qr_login_required: "Login to see your QR",
  me_qr_login_message: "Please login to view your QR code.",
  me_my_qr: "My QR",
  me_qr_close: "Close",
  me_saved: "Saved",
  me_profile_saved_message: "Profile Saved",
  me_updated: "Updated",
  me_address_updated: "Address updated",
  me_profile_title: "Profile",
  me_full_name: "Full name",
  me_full_name_placeholder: "Enter full name",
  me_email: "Email",
  me_email_placeholder: "Enter email address",
  me_phone: "Phone",
  me_phone_placeholder: "Enter phone number",
  me_addresses: "Addresses",
  me_shipping_address: "Shipping Address (Give to Seller)",
  me_delivery_address_home: "Delivery Adress (Your Home)",
  me_edit_shipping_address: "Edit Shipping Address",
  me_edit_delivery_address: "Edit Delivery Address",
  me_save: "Save",
  me_cancel: "Cancel",
  me_receiver_name: "Receiver Name",
  me_receiver_name_placeholder: "Enter Receiver Name",
  me_address_line_1: "Address Line 1",
  me_address_line_1_placeholder: "Enter address",
  me_address_line_2: "Address Line 2",
  me_address_line_2_placeholder: "Enter address",
  me_postcode: "Postcode",
  me_city: "City",
  me_city_placeholder: "e.g. Kuching",
  me_state: "State",
  me_state_placeholder: "e.g. Sarawak",
  me_country: "Country",
  me_country_placeholder: "e.g. Malaysia",
  me_note: "Note (Optional)",
  me_note_placeholder: "Optional",


  //Payment Part
  dashboard_payment: "Payment",
  header_payment: "Payment",
  payment_title: "Payment",
  payment_search_placeholder: "Search by ref / method / status...",
  payment_empty: "No payments",
  payment_method: "Method",
  payment_refno: "Ref No",
  payment_date: "Date",
  common_load_more: "Load More",
  payment_filter_status: "Status",
  payment_filter_method: "Method",
  common_search: "Search...",


  //add payment

  common_saved: "Saved",
  common_error: "Error",
  payment_received_pick_failed: "Failed to pick receipt file.",
  payment_amount_required: "Please enter a valid amount",
  payment_method_required: "Please select payment method",
  payment_ref_required: "Please enter reference no.",
  payment_date_required: "Please enter date",
  payment_receipt_required: "Please upload receipt.",
  payment_add_title: "Add Payment",
  payment_add_subtitle: "Submit payment proof for verification",
  payment_details: "Payment Details",
  common_save: "Save",
  payment_amount: "Amount",
  payment_reference_placeholder: "TXN / bank ref / receipt no",

  payment_upload_receipt: "Upload Receipt",
  payment_tap_to_upload: "Tap to upload receipt",
  payment_upload_hint: "Supports JPG/PNG/PDF",
  common_change: "Change",
  common_remove: "Remove",

  //detail
  payment_detail_title: "Payment Detail",
  payment_detail: "Payment Detail",
  common_edit: "Edit",
  payment_not_found: "Payment not found",
  common_back: "Back",
  common_try_again: "Something went wrong. Please try again.",

  payment_remark: "Remark",
  payment_remark_placeholder: "Enter remark",
  saving: "Saving",

  tracking_get_started: "Get Started",
  tracking_welcome_title: "Track your parcel easily",
  tracking_welcome_subtitle:
    "Enter a tracking number above to see the latest updates.",
  tracking_paste: "Paste",
  tracking_search: "Search",
  tracking_clear: "Clear",
  tracking_recent: "Recent",
  tracking_clear_recent: "Clear",
  tracking_show_less: "Less",
  tracking_show_more: "More",

  forgot_title: "Forgot Password",
  forgot_subtitle: "Enter your username or email. We will send reset instructions",
  forgot_username_email_label: "Username/Email",
  forgot_username_email_placeholder: "Enter username or email",
  forgot_back_to_login: "Back to Login",
  forgot_submit_button: "Send Reset Link",
  forgot_success: "Reset instructions have been sent",
  forgot_error: "Request failed",
  common_success: "Success",
  forgot_missing_fields: "Please enter your username or email",

  common_not_found: "Not found",
  common_action_failed: "Failed",
  payment_attachment: "Attachment",
  common_processing: "Processing",
  common_close: "Close",
  common_view: "View",


};

export default en;

// Optional: export type for keys, can be reused elsewhere if needed
export type EnTranslationKey = keyof typeof en;
