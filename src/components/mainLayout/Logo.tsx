"use client"

import React from 'react'

function Logo({ link, className }: any) {
    return (
        <div>
            <img
                src={link}
                width={200}
                height={40}
                alt="Logo"
                className={`text-center mx-auto ${className}`}
            />
        </div>
    )
}

export default Logo