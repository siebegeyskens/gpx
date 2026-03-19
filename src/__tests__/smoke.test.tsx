import { render, screen } from '@testing-library/react'

import { GpxUpload } from '../components/GpxUpload'

describe('smoke', () => {
  it('renders the GPX upload UI', () => {
    render(<GpxUpload onGpxLoaded={() => {}} />)
    expect(screen.getByText(/GPX Upload/i)).toBeInTheDocument()
  })
})

