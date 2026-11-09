"use client";

import { Link, useParams } from "../nav";
import { useState } from "react";

const pages = {
  "about-us": {
    title: "About Us",
    body: (
      <>
        <h1>About us</h1>
        <p>WELCOME TO VARIETY BY HA</p>
        <p>Through decades of experience in developing and producing world renown fashion brands, KAP has built itself a legendary image globally. VARIETY BY HA is a new creation of KAP with selection of materials, designs and cuts that appeal to broader demographics who value femininity, originality and freedom within values.</p>
        <p>VARIETY BY HA has everything it needs for captivating women who love fashion and are always on the lookout for the new exciting trends.</p>
      </>
    ),
  },
  "contact-us": { title: "Contact Us", contact: true },
  "return-exchange-policy": {
    title: "Return/Exchange Policy",
    body: (
      <>
        <h1>Return/Exchange Policy</h1>
        <p>Unworn pieces with tags can be exchanged within 7 days of delivery. Stitched orders follow the note on the product. Raise a request from the form linked in the footer, or write to info@varietybyha.com.</p>
      </>
    ),
  },
  "international-shipping-policy": {
    title: "International Shipping Policy",
    body: (
      <>
        <h1>International Shipping Policy</h1>
        <p>Prepaid orders inside Pakistan ship free. International orders are dispatched after the address is confirmed at checkout. Duties, if any, are paid by the receiver.</p>
      </>
    ),
  },
  "terms-conditions": {
    title: "Terms & Conditions",
    body: (
      <>
        <h1>Terms & Conditions</h1>
        <p>Prices are in Pakistani rupees and include tax. Colour on your screen can differ from the fabric. Placing an order confirms the size, piece count, and delivery address you entered.</p>
      </>
    ),
  },
  "privacy-policy": {
    title: "Privacy Policy",
    body: (
      <>
        <h1>Privacy Policy</h1>
        <p>The email you leave for the newsletter or checkout is used for that order and, if you opt in, for new arrivals. This preview shop stores the cart and sign-in only in your browser.</p>
      </>
    ),
  },
  "general-payment-order-policies": {
    title: "General Payment & Order Policies",
    body: (
      <>
        <h1>General Payment & Order Policies</h1>
        <p>Pay the shop Easypaisa, JazzCash, or bank account shown at checkout, then enter the transaction ID. Card numbers and wallet PINs are not collected. For cash on delivery, do not pay the courier until the parcel is in your hands.</p>
      </>
    ),
  },
};

export default function StaticPage() {
  const { handle } = useParams();
  const page = pages[handle];
  if (!page) return <div className="wrap page"><p>Page not found.</p></div>;
  return (
    <div className="wrap page prose">
      <p className="crumbs"><Link to="/">Home</Link> <span>›</span> {page.title}</p>
      {page.contact ? <Contact /> : page.body}
    </div>
  );
}

function Contact() {
  const [sent, setSent] = useState(false);
  if (sent) return <p>Thank you. We have your message.</p>;
  return (
    <>
      <h1>Contact Us</h1>
      <p>Have a question or comment? Use the form below to send us a message or contact us by mail at:</p>
      <div className="contact-grid">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <label>Name<input name="name" /></label>
          <label>Phone number<input name="phone" /></label>
          <label>Email *<input required type="email" name="email" /></label>
          <label>Comment *<textarea required name="comment" /></label>
          <button className="btn" type="submit">Send</button>
        </form>
        <aside>
          <h2>Get In Touch!</h2>
          <p>We'd love to hear from you — please use the form to send us your message or ideas.</p>
          <p>TEXT: +92310 4644418<br />info@varietybyha.com<br />30KM Multan Road Lahore<br />Opening Hours: MON to FRI: 10:00AM - 06:00PM</p>
        </aside>
      </div>
    </>
  );
}
