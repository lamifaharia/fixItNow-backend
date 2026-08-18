import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma";
import { Role, BookingStatus, PaymentStatus } from "./generated/prisma/enums";
import { randomUUID } from "crypto";

async function main() {
  // =========================
  // PASSWORD
  // =========================

  const password = await bcrypt.hash("password123", 10);

  // =========================
  // USERS
  // =========================

  const [admin, customer1, customer2, technician1, technician2] =
    await Promise.all([
      prisma.user.create({
        data: {
          name: "Admin User",
          email: "admin@fixitnow.com",
          password,
          role: Role.ADMIN,
          isApprove: true,
        },
      }),

      prisma.user.create({
        data: {
          name: "John Doe",
          email: "john@gmail.com",
          password,
          role: Role.CUSTOMER,
          phone: "01711111111",
          address: "Gulshan, Dhaka",
          isApprove: true,
        },
      }),

      prisma.user.create({
        data: {
          name: "Sarah Khan",
          email: "sarah@gmail.com",
          password,
          role: Role.CUSTOMER,
          phone: "01722222222",
          address: "Dhanmondi, Dhaka",
          isApprove: true,
        },
      }),

      prisma.user.create({
        data: {
          name: "Michael Hasan",
          email: "michael@gmail.com",
          password,
          role: Role.TECHNICIAN,
          phone: "01733333333",
          address: "Banani, Dhaka",
          isApprove: true,
        },
      }),

      prisma.user.create({
        data: {
          name: "David Rahman",
          email: "david@gmail.com",
          password,
          role: Role.TECHNICIAN,
          phone: "01744444444",
          address: "Mirpur, Dhaka",
          isApprove: true,
        },
      }),
    ]);

  console.log("Created 5 users");

  // =========================
  // CATEGORIES
  // =========================

  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Plumbing",
        description: "Professional plumbing and pipe repair services",
      },
    }),

    prisma.category.create({
      data: {
        name: "Electrical",
        description: "Electrical installation and repair services",
      },
    }),

    prisma.category.create({
      data: {
        name: "Cleaning",
        description: "Home and office cleaning services",
      },
    }),

    prisma.category.create({
      data: {
        name: "AC Repair",
        description: "Air conditioner servicing and repair",
      },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // =========================
  // SERVICES
  // =========================

  const plumbingCategory = categories.find(
    (category) => category.name === "Plumbing"
  );

  const electricalCategory = categories.find(
    (category) => category.name === "Electrical"
  );

  const cleaningCategory = categories.find(
    (category) => category.name === "Cleaning"
  );

  const acCategory = categories.find(
    (category) => category.name === "AC Repair"
  );

  if (
    !plumbingCategory ||
    !electricalCategory ||
    !cleaningCategory ||
    !acCategory
  ) {
    throw new Error("Required categories were not found");
  }

  const services = await Promise.all([
    prisma.service.create({
      data: {
        title: "Pipe Repair",
        description: "Professional water pipe repair service",
        price: 1500,
        duration: 120,
        categoryId: plumbingCategory.id,
        technicianId: technician1.id,
      },
    }),

    prisma.service.create({
      data: {
        title: "Bathroom Plumbing",
        description: "Complete bathroom plumbing repair and maintenance",
        price: 2500,
        duration: 180,
        categoryId: plumbingCategory.id,
        technicianId: technician1.id,
      },
    }),

    prisma.service.create({
      data: {
        title: "Home Electrical Repair",
        description: "Electrical wiring and repair service",
        price: 2000,
        duration: 120,
        categoryId: electricalCategory.id,
        technicianId: technician2.id,
      },
    }),

    prisma.service.create({
      data: {
        title: "Fan Installation",
        description: "Professional ceiling fan installation",
        price: 1000,
        duration: 60,
        categoryId: electricalCategory.id,
        technicianId: technician2.id,
      },
    }),

    prisma.service.create({
      data: {
        title: "Home Deep Cleaning",
        description: "Complete deep cleaning for your home",
        price: 3500,
        duration: 240,
        categoryId: cleaningCategory.id,
        technicianId: technician1.id,
      },
    }),

    prisma.service.create({
      data: {
        title: "AC Servicing",
        description: "Complete air conditioner cleaning and servicing",
        price: 1800,
        duration: 120,
        categoryId: acCategory.id,
        technicianId: technician2.id,
      },
    }),
  ]);

  console.log(`Created ${services.length} services`);

  // =========================
  // BOOKINGS
  // =========================

  const bookings = [
    {
      customer: customer1,
      service: services[0],
      bookingDate: new Date("2026-08-20"),
      serviceAddress: "Gulshan, Dhaka",
      note: "Kitchen pipe is leaking",
      status: BookingStatus.ACCEPTED,
    },

    {
      customer: customer1,
      service: services[2],
      bookingDate: new Date("2026-08-21"),
      serviceAddress: "Gulshan, Dhaka",
      note: "Need electrical wiring check",
      status: BookingStatus.COMPLETED,
    },

    {
      customer: customer2,
      service: services[4],
      bookingDate: new Date("2026-08-22"),
      serviceAddress: "Dhanmondi, Dhaka",
      note: "Need complete home cleaning",
      status: BookingStatus.PENDING,
    },

    {
      customer: customer2,
      service: services[5],
      bookingDate: new Date("2026-08-23"),
      serviceAddress: "Dhanmondi, Dhaka",
      note: "AC is not cooling properly",
      status: BookingStatus.COMPLETED,
    },
  ];

  const createdBookings = [];

  for (const bookingData of bookings) {
    const booking = await prisma.booking.create({
      data: {
        customerId: bookingData.customer.id,
        serviceId: bookingData.service.id,
        bookingDate: bookingData.bookingDate,
        serviceAddress: bookingData.serviceAddress,
        note: bookingData.note,
        totalPrice: bookingData.service.price,
        status: bookingData.status,
      },
    });

    createdBookings.push(booking);
  }

  console.log(`Created ${createdBookings.length} bookings`);

  // =========================
  // PAYMENTS
  // =========================

  const completedBookings = createdBookings.filter(
    (booking) => booking.status === BookingStatus.COMPLETED
  );

  for (const booking of completedBookings) {
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        transactionId: randomUUID(),
        paymentMethod: "CARD",
        status: PaymentStatus.SUCCESS,
      },
    });
  }

  console.log(`Created ${completedBookings.length} payments`);

  // =========================
  // REVIEWS
  // =========================

  const firstCompletedBooking = createdBookings.find(
    (booking) => booking.status === BookingStatus.COMPLETED
  );

  if (firstCompletedBooking) {
    await prisma.review.create({
      data: {
        rating: 5,
        comment: "Excellent service. The technician was very professional.",
        customerId: customer1.id,
        bookingId: firstCompletedBooking.id,
        serviceId: firstCompletedBooking.serviceId,
      },
    });
  }

  const secondCompletedBooking = createdBookings
    .filter((booking) => booking.status === BookingStatus.COMPLETED)
    .at(1);

  if (secondCompletedBooking) {
    await prisma.review.create({
      data: {
        rating: 4,
        comment: "Good service and arrived on time.",
        customerId: customer2.id,
        bookingId: secondCompletedBooking.id,
        serviceId: secondCompletedBooking.serviceId,
      },
    });
  }

  console.log("Created reviews");

  console.log("🌱 Seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });