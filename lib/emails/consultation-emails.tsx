import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

export type ConsultationEmailBooking = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  date: string;
  time: string;
  source: "public" | "checkout";
  timezone?: string;
  meetUrl?: string;
};

const bodyStyle = {
  backgroundColor: "#f6f9fc",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  margin: "24px auto",
  padding: "24px",
  maxWidth: "560px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
};

function ConsultationCustomerEmail({ booking }: { booking: ConsultationEmailBooking }) {
  return (
    <Html>
      <Head />
      <Preview>Потвърждение за консултация - DigiStart</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={{ marginTop: 0 }}>Консултацията е потвърдена</Heading>
          <Text>Здравейте, {booking.name},</Text>
          <Text>
            Вашата консултация е записана за {booking.date} {booking.time} (
            {booking.timezone ?? "Europe/Sofia"}).
          </Text>
          <Text>Google Meet: {booking.meetUrl ?? "Ще бъде добавен допълнително"}</Text>
          <Hr />
          <Text style={{ color: "#6b7280", fontSize: "12px" }}>Поздрави,</Text>
          <Text style={{ marginTop: 0 }}>DigiStart</Text>
        </Container>
      </Body>
    </Html>
  );
}

function ConsultationAdminEmail({ booking }: { booking: ConsultationEmailBooking }) {
  return (
    <Html>
      <Head />
      <Preview>Нова консултация: {booking.name}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Heading style={{ marginTop: 0 }}>Нова заявка за консултация</Heading>
          <Section>
            <Text>
              Консултация: {booking.date} {booking.time} (
              {booking.timezone ?? "Europe/Sofia"})
            </Text>
            <Text>Клиент: {booking.name}</Text>
            <Text>Имейл: {booking.email}</Text>
            <Text>Телефон: {booking.phone}</Text>
            <Text>Източник: {booking.source}</Text>
            <Text>Компания: {booking.company ?? "-"}</Text>
            <Text>Google Meet: {booking.meetUrl ?? "Ще бъде добавен допълнително"}</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function renderConsultationCustomerEmailHtml(
  booking: ConsultationEmailBooking
) {
  return await render(<ConsultationCustomerEmail booking={booking} />);
}

export async function renderConsultationAdminEmailHtml(
  booking: ConsultationEmailBooking
) {
  return await render(<ConsultationAdminEmail booking={booking} />);
}
