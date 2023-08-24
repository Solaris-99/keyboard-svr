const net = require('net')
const { exec } = require('child_process');
let modifier_table = [false,false,false,false] //shift, control, alt, capslock

let host_ip = "localhost";



exec("powershell ipconfig", (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout)
    host_ip = stdout.match(/Direcci.n IPv4.*?: ((?:[0-9]{1,3}\.?){4})/)[1]
    console.log("Host IP: "+host_ip)
})

let opts = {
    host: host_ip,
    port: 8001
}

function emitKeyEvent(key) {
    key = new String(key)
    modifiers = ""
    if(key== "SPACE"){
            key = " "
        }
        else if(key== "WIN"){
            key = "^ESC"
        }
        else if(key == "MENU"){
            key = "+F10"
        }
    if (modifier_table[0]){
        modifiers += "+" //shift
    }
    if (modifier_table[1]){
        modifiers += "^" //control
    }
    if (modifier_table[2]){
        modifiers += "%" //alt
    }
    if (!modifier_table[3]&& key.length == 1){
        key = key.toLowerCase()
    }
    let command;
    if(key.length>1){
        command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${modifiers}{${key}}')"`;
    }
    else{
        command = `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${key}')"`
    }
    
    exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
  });
}

const server = net.createServer()


server.listen(opts,()=>{
    console.log('listening in port: '+ opts['port'])
})

server.on('connection', (socket)=> {
    socket.on('data', (data)=>{
        console.log('Recieved: '+data) // keyboard functions
        //data_number -> WINDOW KEY
        if(data == "SHIFT"){
            modifier_table[0] = !modifier_table[0]
        }
        else if (data=="CTRL"){
            modifier_table[1] = !modifier_table[1]
        }
        else if (data =="ALT"){
            modifier_table[2] = !modifier_table[2]
        }
        else if (data == "ALT GR"){
            modifier_table[1] = !modifier_table[1]
            modifier_table[2] = !modifier_table[2]  
        } 
        else if (data == "CAPS LOCK"){
            modifier_table[3] = !modifier_table[3]
        }

        else{
            emitKeyEvent(data)
        }
    })
})

server.on('close',()=>{
    console.log('server offline')
})

server.on('error',(err)=> {
    console.log(err.message)
})

