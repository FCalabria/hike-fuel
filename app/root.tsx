import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import './index.css';
import './tailwind.css';
import { LoaderFunction } from '@remix-run/node';
import { rootAuthLoader } from '@clerk/remix/ssr.server';
import { ClerkApp } from '@clerk/remix';

export const loader: LoaderFunction = (args) => {
  if (!process.env.CLERK_SECRET_KEY) {
    return {
      clerkState: {
        __internal_clerk_state: {
          __clerk_ssr_state: null,
          __publishableKey: 'pk_test_bW9jay1jbGVyay1rZXkk',
        },
      },
    };
  }
  return rootAuthLoader(args);
};

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function App() {
  return <Outlet />;
}

export default ClerkApp(App, {
  appearance: {
    variables: {
      borderRadius: '0',
    },
  },
});
