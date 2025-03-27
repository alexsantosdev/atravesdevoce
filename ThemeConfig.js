import { createGlobalStyle } from 'styled-components'

export const defaultTheme = {
    header: {
        backgroundColor: 'var(--white)',
        linkBackgroundColor: 'var(--gray-75)',
        linkTextColor: 'var(--gray-500)',
        linkTextActiveColor: 'var(--gray-700)',
        linkTextHoverColor: 'var(--green-500)'
    },
    button: {
        backgroundColor: 'var(--green-500)',
        borderColor: 'var(--green-480)',
        textColor: 'var(--white)'
    }
}

export const GlobalStyles = createGlobalStyle`
    body {
        background: var(--white);
        color: var(--gray-800);
    }
`