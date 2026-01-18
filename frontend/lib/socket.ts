import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
            path: '/socket.io/',
            transports: ['websocket'],
            autoConnect: true,
            query: {
                // Pass auth token if needed, or handle auth logic in onConnect
            }
        });
    }
    return socket;
};

export const connectSocket = (token: string) => {
    if (socket) {
        socket.disconnect();
    }
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
        path: '/socket.io/',
        transports: ['websocket'],
        auth: {
            token
        }
    });

    // Connect to dashboard namespace
    // Actually our backend Gateway uses /dashboard namespace? 
    // Let me check the backend gateway... 
    // Yes: @WebSocketGateway({ namespace: 'dashboard', cors: ... })
    // So we need to connect to that namespace.
}

export const getDashboardSocket = (token?: string) => {
    const url = (process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000') + '/dashboard';

    // If token provided, create new connection with auth
    if (token) {
        return io(url, {
            auth: { token },
            transports: ['websocket']
        });
    }

    return io(url, { transports: ['websocket'] });
}
