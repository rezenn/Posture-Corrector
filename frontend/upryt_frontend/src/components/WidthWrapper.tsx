import React from 'react'

const WidthWrapper = ({ children }:{children:React.ReactNode}) => {
    return (
        <div className='w-full'>
            <div className='w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-0'>
                {children}
            </div>
        </div>
    )
}

export default WidthWrapper