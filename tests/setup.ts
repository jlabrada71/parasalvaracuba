// Make import.meta.client = true for all tests (simulates browser environment)
Object.defineProperty(import.meta, 'client', { value: true, writable: true })
Object.defineProperty(import.meta, 'server', { value: false, writable: true })
