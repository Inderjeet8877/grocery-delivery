export const formatDateTime = (timestamp: number) =>
    new Date(timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
