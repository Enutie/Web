
export interface Game {
  title: string
  number: string
  engine: string
  shippedDate: string 
  quip: string
  playUrl: string
  devlogUrl: string
  screenshot?: string
}

export const games: Game[] = [
  {
    title: 'PONG',
    number: '01',
    engine: 'godot',
    shippedDate: 'sep 25',
    quip: 'the ball only clips sometimes',
    playUrl: 'https://pong.enutie.com',
    devlogUrl: 'https://blog.enutie.com/posts/first-game/',
    screenshot: '/games/pong.png'
  },
]
