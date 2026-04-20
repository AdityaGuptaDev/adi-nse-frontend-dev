'use client';

import type { NextPage } from "next";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { BsCurrencyDollar, BsHeartPulseFill } from "react-icons/bs";
import { HiMiniCurrencyDollar, HiOutlineUserPlus, HiOutlineCreditCard   } from "react-icons/hi2";
const cardData = [
    {
      title: "Total Revenue",
      amount: "$43,9923",
      percentage: "+20.1% from last month",
    //   icon: <BsCurrencyDollar />,
      icon: <HiMiniCurrencyDollar  />,
    },
    {
      title: "Subscription",
      amount: "+2350",
      percentage: "+180.1% from last month",
    //   icon: <AiOutlineUsergroupAdd />,
      icon: <HiOutlineUserPlus />,
    },
    {
      title: "Sales",
      amount: "+2350",
      percentage: "-5.3% from last month",
    //   icon: <AiOutlineCreditCard />,
      icon: <HiOutlineCreditCard  />,
    },
    {
      title: "Active Now",
      amount: "+1,234",
      percentage: "+12.8% from last month",
    //   icon: <TbActivityHeartbeat />,
      icon: <BsHeartPulseFill  />,
    },
  ];
const DashboardSummary: NextPage = () => {
  return (
    <>
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 ">
            {/* {cardData.map((card, index) => (
              <Card key={index} shadow={true} className="p-4 border border-gray">
                <CardHeader color="transparent" floated={false} shadow={false} className="mx-0 flex items-center gap-4 pt-0 pb-8">
                  <div className="flex w-full flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <Typography variant="h5" color="blue-gray">
                        {card.title}
                      </Typography>
                      <div className="text-proses-secondary bg-transparent shadow-lg border-2 border-[#2A2A2A] p-2 rounded-full">
                        {card.icon}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="px-0 py-1">
                    <div className="grid justify-items-stretch">
                    <Typography>{card.percentage}</Typography>
                    <div className="bg-[#2A2A2A]/50 py-1 px-2">
                    <Typography className="font-bold justify-self-end text-proses-secondary">{card.amount}</Typography>
                    </div>
                    </div>
                
                </CardBody>
              </Card>
            ))} */}
          </div>
    </>
  )
}

export default DashboardSummary