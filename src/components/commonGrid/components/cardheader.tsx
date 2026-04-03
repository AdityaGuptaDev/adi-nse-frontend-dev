"use client";

import { Button, Typography } from "@material-tailwind/react";
import { UserPlusIcon } from "lucide-react";
import React from "react";

function CardTypeHeader() {
  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-8">
        <div>
          <Typography variant="h5" color="blue-gray">
            Members list
          </Typography>
          <Typography color="gray" className="mt-1 font-normal">
            See information about all members
          </Typography>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button variant="outlined" size="sm">
            view all
          </Button>
          <Button className="flex items-center gap-3" size="sm">
            <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> Add member
          </Button>
        </div>
      </div>
    </>
  );
}

export default CardTypeHeader;
