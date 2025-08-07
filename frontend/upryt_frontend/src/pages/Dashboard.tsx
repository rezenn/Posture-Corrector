import React from 'react'
import SideNavbar from "../components/sidenavbar"
import PostureChart from './PostureChart.tsx';

const Dashboard = () => {
    return (
        <section className="flex h-screen overflow-hidden">
            <aside className="w-64 bg-white shadow-md">
                <SideNavbar />
            </aside>
            <main className="flex-1 overflow-y-auto p-6">
                <PostureChart />
            </main>
        </section>
    )
}

export default Dashboard
