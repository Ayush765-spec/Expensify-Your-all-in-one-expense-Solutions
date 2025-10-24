"use client";

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import React, { ReactNode } from 'react'

function RootProviders({children}:{children:ReactNode}){
    return <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem={true}
    disableTransitionOnChange={true}
    >
        {children}
        <Toaster />
    </ThemeProvider>
}

export default RootProviders;