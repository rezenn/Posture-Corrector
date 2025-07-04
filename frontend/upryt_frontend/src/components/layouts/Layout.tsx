"use client";

import type { ReactNode } from "react";

type LayoutProps = {
    children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    return (
        <>
            <main>{children}</main>
        </>
    )
}

export default Layout
