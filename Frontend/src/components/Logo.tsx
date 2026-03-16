import React from 'react'

function Logo({width = '100px'}) {
  return (
    <div style={{width:width}}>
        <img src="siteLogo3.png" alt="Aniverse Logo" style={{width:width}}/>
    </div>
  )
}

export default Logo