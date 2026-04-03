"use client";

import React from "react";

const customers = [
  {
    name: "Tania Andrew",
    email: "tania@gmail.com",
    price: 400,
    image:
      "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-1.jpg",
  },
  {
    name: "John Micheal",
    email: "john@gmail.com",
    price: 420,
    image:
      "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-6.jpg",
  },
  {
    name: "Alexa Liras",
    email: "alexa@gmail.com",
    price: 340,
    image:
      "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-2.jpg",
  },
  {
    name: "Richard Gran",
    email: "richard@gmail.com",
    price: 520,
    image:
      "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-3.jpg",
  },
  {
    name: "Micheal Levi",
    email: "levi@gmail.com",
    price: 780,
    image:
      "https://demos.creative-tim.com/test/corporate-ui-dashboard/assets/img/team-4.jpg",
  },
];

function RecentSales(props: any) {
  return (
    <div className="w-full">
      {/* <Card className="border border-gray">
                <CardBody>
                    <div className="mb-1 flex items-center justify-between">
                        <Typography variant="h5" color="blue-gray" className="">
                            Recent Sales
                        </Typography>
                    </div>
                    <div>
                        <Typography
                            variant="small"
                            className="font-bold"
                        >
                            You made 265 sales this month.
                        </Typography>
                    </div>
                    <div className="divide-y divide-gray-200 mt-4">
                        {customers.map(({ name, email, price, image }, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between pb-3 pt-3 last:pb-0"
                            >
                                <div className="flex items-center gap-x-3">
                                    <Avatar size="sm" src={image} alt={name} />
                                    <div>
                                        <Typography color="blue-gray" variant="h6">
                                            {name}
                                        </Typography>
                                        <Typography variant="small" color="gray">
                                            {email}
                                        </Typography>
                                    </div>
                                </div>
                                <Typography color="blue-gray" variant="h6">
                                    ${price}
                                </Typography>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card> */}
    </div>
  );
}

export default RecentSales;
