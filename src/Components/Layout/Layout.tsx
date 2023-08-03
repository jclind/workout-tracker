import React from 'react'
import Nav from '../Nav/Nav'

type LayoutProps = {
  children: React.ReactElement
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <>
      <Nav />
      {children}
    </>
  )
}

export default Layout
