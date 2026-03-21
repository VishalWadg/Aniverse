import React from 'react'

function Logo({width = '100px'}) {
  return (
    <div style={{width}} className="text-white">
        <svg
            viewBox="0 0 320 56"
            className="h-auto w-full"
            role="img"
            aria-label="Aniverse"
        >
            <title>Aniverse</title>
            <text
                x="0"
                y="41"
                fill="currentColor"
                fontFamily="'Figtree Variable', sans-serif"
                fontSize="42"
                fontWeight="900"
                letterSpacing="-2"
            >
                ANIVERSE
            </text>
        </svg>
    </div>
  )
}

export default Logo
