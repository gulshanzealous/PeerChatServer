import dgram from 'dgram'
const udpServer = dgram.createSocket('udp4')

class UdpSocket {
	constructor(id,firstAddress,firstPort,dataInit,initiated,secondAddress,secondPort,terminated){
		this.id = id
		this.firstAddress = firstAddress
		this.firstPort = firstPort
		this.dataInit = dataInit
		this.initiated = 'false'
		this.secondAddress = secondAddress || null
		this.secondPort = secondPort || null
		this.terminated = 'false'
	}
}

let udpSockets = []

udpServer.on('message',(rawmsg,rinfo)=>{
	console.log(`udpSockets:${JSON.stringify(udpSockets,null,4)}`)

	let [ id, terminated, data  ] = rawmsg.toString('utf8').trim().split('.') // this should be done by video format
	let { address, port } = rinfo

	console.log(`incoming id:${id},terminated:${terminated},data:${data},address:${address},port:${port}`)

	// udpServer.send( Buffer.from('connected to server'), address, port )

	let socketMatchArray = udpSockets.filter(socket => socket.id === id )
	let socket = socketMatchArray[0]

	console.log(`socket matched:${JSON.stringify(socket,null,4)}`)

	if(socket === null || socket === undefined || socket === {} || socket === [] ){
		// no one from this pair has ever resistered
		console.log('never registered before')
		let socket = new UdpSocket(id,address,port,data)
		udpSockets.push(socket)
		udpServer.send(Buffer.from('Server: You have been registered\n'), port, address)

	} else if( socket.initiated === 'true' ) {
		// mathed id and has connected before. subsequent message
		// this means both the leeches have connected atleast once, only check for these two's credentials
		if(socket.terminated === 'true'){

			udpServer.send( Buffer.from('Server: Session expired') , socket.firstPort, socket.firstAddress )	
			udpServer.send( Buffer.from('Server: Session expired') , socket.secondPort, socket.secondAddress )	

		} else if( address === socket.firstAddress && port === socket.firstPort ){

			console.log('first socket')
			udpServer.send( Buffer.from(data) , socket.secondPort, socket.secondAddress )
			socket.terminated = terminated
	
		} else if( address === socket.secondAddress && port === socket.secondPort ) {

			console.log('second socket')
			udpServer.send( Buffer.from(data) , socket.firstPort, socket.firstAddress )
			socket.terminated = terminated

		} else {

			udpServer.send( Buffer.from('error occurred'), socket.firstPort, socket.firstAddress )
			udpServer.send( Buffer.from('error occurred'), socket.secondPort, socket.secondAddress )

		}

	} else {  //( socket.initiated === false )
		// matched id and this is first connection of this pair
		// this means the first leech has registered but second has not, this is the second for the first time
		if(socket.firstPort === port){
			//same leech found itself, tell it to wait for the other one
			return udpServer.send( Buffer.from('wait for the other one'), socket.firstPort, socket.firstAddress )
		}
		udpServer.send( Buffer.from(socket.dataInit), port, address )
		udpServer.send( Buffer.from(data), firstPort, firstAddress )
		socket.initiated = 'true'
		socket.secondAddress = address
		socket.secondPort = port 

	}


})


udpServer.on('listening', () => {
	var address = udpServer.address()
	console.log(`udpServer listening ${address.address}:${address.port}`)
})

udpServer.on('error', (err) => {
	console.log(`udpServer error:\n${err.stack}`)
	udpServer.close()
})

udpServer.bind(33476,'192.168.0.102',()=>{
	var address = udpServer.address()
	console.log(`udpServer bound at ${address.address}:${address.port}`)
})
