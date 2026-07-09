/**
 * Contact Section Content
 * Static content for the contact page
 */

// Contact Info Items
export interface ContactInfoItem {
  icon: string;
  labelKey: string;
  value: string;
  type: 'email' | 'responseTime';
}

export const contactInfo: ContactInfoItem[] = [
  {
    icon: 'Mail',
    labelKey: 'contact.info.email',
    value: 'contact',
    type: 'email',
  },
  {
    icon: 'Clock',
    labelKey: 'contact.info.response',
    value: '24-48 hours',
    type: 'responseTime',
  },
];

// Contact Form Fields
export const contactFormFields = {
  name: {
    id: 'name',
    name: 'name',
    placeholderKey: 'contact.form.name',
    required: true,
    type: 'text',
  },
  email: {
    id: 'email',
    name: 'email',
    placeholderKey: 'contact.form.email',
    required: true,
    type: 'email',
  },
  subject: {
    id: 'subject',
    name: 'subject',
    placeholderKey: 'contact.form.subject',
    required: false,
    type: 'text',
  },
  message: {
    id: 'message',
    name: 'message',
    placeholderKey: 'contact.form.message',
    required: true,
    type: 'textarea',
    rows: 5,
  },
} as const;

// Success Message
export const contactSuccessMessage = {
  title: {
    en: 'Message Sent!',
    ar: 'تم إرسال الرسالة!',
  },
  icon: 'Send',
} as const;

// Business Information
export const businessInfo = {
  responseTime: '24-48 hours',
  workingDays: 'business days',
} as const;

// Contact Page Description
export const contactPageDescription = {
  en: 'For business inquiries, collaborations, or press requests, please contact us through the form. We typically respond within 24-48 hours during business days.',
  ar: 'للاستفسارات التجارية أو التعاون أو طلبات الصحافة، يرجى الاتصال بنا من خلال النموذج. نحن عادة نرد خلال 24-48 ساعة خلال أيام العمل.',
} as const;

// Full Contact Content Export
export const contactContent = {
  info: contactInfo,
  formFields: contactFormFields,
  successMessage: contactSuccessMessage,
  businessInfo,
  pageDescription: contactPageDescription,
} as const;

export type ContactContent = typeof contactContent;
