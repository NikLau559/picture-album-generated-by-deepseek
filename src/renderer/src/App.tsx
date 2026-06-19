import { ErrorBoundary } from './components/common/ErrorBoundary'
import { AppShell } from './components/layout/AppShell'

export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  )
}
