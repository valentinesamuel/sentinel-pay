export interface MailGunEmailInterface {
  to: string | string[];
  from: string;
  subject?: string;
  template?: string;
  'h:X-Mailgun-Variables'?: object;
  text?: string;
  html?: string;
}
