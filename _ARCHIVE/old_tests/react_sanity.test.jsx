import React from 'react';
import { render } from '@testing-library/react';

const TestComponent = () => <div>Hello World</div>;

test('renders react component', () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText('Hello World')).toBeInTheDocument();
});
