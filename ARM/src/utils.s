// utils.s
// Biblioteca común para los módulos ARM64 del Invernadero Inteligente IoT

// funciones que maneja el utils.s:
//   - atoi_csv            : Convierte ASCII a entero desde buffer 
//   - read_column_to_stack: Lee una columna del CSV y apila los valores 
//   - utils_open_file     : Abre lecturas.csv                         
//   - utils_read_file     : Lee el contenido al buffer                
//   - utils_close_file    : Cierra el archivo                         
//   - utils_skip_to_next_line  : Salta hasta '\n' o '$'              
//   - utils_skip_to_next_column: Salta hasta ',', '\n' o '$'         
//   - utils_save_number   : Guarda un número en el stack            
//   - print_uint          : Imprime un entero sin signo en stdout     
//   - write_file_open     : Abre/crea un archivo de salida para escritura 
//   - write_file_write    : Escribe bytes en un archivo ya abierto    
//   - write_file_close    : Cierra un archivo de salida             

// registros y los datos que maneja:
//   x5  = base 10 (para los atoi de csv y el de argumentos)
//   x10 = resultado numérico de atoi_csv
//   x13 = numero de la columna incial
//   x14 = numero de la columna final
//   x17 = contador de la linea actual y se inicializa en 1 por saltar la primera linea del csv 
//   x7  = bandera: 1 si atoi_csv leyó al menos un dígito
//   w23 = último delimitador leído por atoi_csv
//   x19 = descriptor de archivo (fd) del CSV de entrada
//   x20 = bytes leídos del archivo
//   x21 = puntero actual dentro del buffer
//   x22 = contador de números guardados en stack
//   x11 = número de columna seleccionada (lo pasa el caller)
//   x28 = límite superior del área de datos en stack
//   x27 = posición para restaurar el stack al terminar

.data

utils_results_dir:
    .asciz "arm64_results/"

utils_filename:
    .asciz "lecturas.csv"

utils_err_open:
    .ascii "Error al abrir el archivo de lecturas.csv\n"
    utils_err_open_len = . - utils_err_open

utils_err_read:
    .ascii "Error al leer el archivo de lecturas.csv\n"
    utils_err_read_len = . - utils_err_read

utils_err_validacion:
    .ascii "Error de validacion\n"
    utils_err_validacion_len = . - utils_err_validacion

utils_err_filename:
    .asciz "resultado_error_validacion.txt"

utils_err_file_content:
    .ascii "MODULE=HISTORICAL_ANALYZER\n"
    .ascii "STATUS=ERROR\n"
    .ascii "ERROR=INVALID_VALIDATION\n"
    .ascii "DETAIL=VALIDATION_FAILED\n"
    utils_err_file_content_len = . - utils_err_file_content

// Buffer interno para conversión de entero a ASCII (print_uint))(pantalla) y ahora tambien para (archivo)
utils_num_buffer:
    .skip 32

// Buffer temporal para construir la ruta completa de salida
utils_output_path:
    .skip 256
    
utils_newline:
    .ascii "\n"

utils_error_code:
    .quad 0


// SECCIÓN BSS

.bss

// Buffer donde se carga el contenido completo de lecturas.csv
utils_buffer:
    .skip 32768 //4096 //8192 //32768



// SECCIÓN DE CÓDIGO

.text

//--------------Utils.s para la fase 2 inicio---------------------------------------------------------

//atoi_arg que es para los argumentos de la fila inicial y final
atoi_arg:
    mov x10, #0             

atoi_arg_loop:
    ldrb w23, [x0], #1     

    cmp w23, '0'
    blt atoi_arg_done       

    cmp w23, '9'
    bgt atoi_arg_done       

    sub w23, w23, '0'       

    mov x4, x10
    mul x10, x4, x5         

    add x10, x10, x23       

    b atoi_arg_loop

atoi_arg_done:
    mov x0, x10             
    ret


//nuevo atoi de entero a ascii para que lo que hace es tomar el numero de x0, lo convierte eb caracteres en num_buf 
//una vez lo covierte se llama a write_file_write para guardarlo en el archivo de texto de las salidas
utils_write_uint:
    stp x29, x30, [sp, #-16]!
    mov x29, sp

    ldr x1, =utils_num_buffer
    add x1, x1, #31           // apuntar al final del buffer
    mov x3, #10               // base 10
    mov x4, #0                // contador de caracteres

    // caso especial si el número es cero
    cmp x0, #0
    bne utils_ciclo_conv
    sub x1, x1, #1
    mov w2, '0'
    strb w2, [x1]
    mov x4, #1
    b utils_mandar_a_archivo

utils_ciclo_conv: //ciclo de conversion de entero a ascii
    udiv x5, x0, x3
    msub x6, x5, x3, x0
    add x6, x6, '0'
    sub x1, x1, #1
    strb w6, [x1]
    add x4, x4, #1
    mov x0, x5
    cbnz x0, utils_ciclo_conv

utils_mandar_a_archivo:
    mov x2, x4
    bl write_file_write       // escribe el número convertido 

    ldr x1, =utils_newline // salto de linea despues del num
    mov x2, #1
    bl write_file_write

    ldp x29, x30, [sp], #16
    ret

//--------------Utils.s para la fase 2 fin------------------------------------------------------------

// atoi_csv
// Convierte una cadena ASCII decimal a entero, leyendo byte a byte desde x21.
// Se detiene al encontrar un carácter que no sea dígito (',' '\n' '$' o cualquier otro)
atoi_csv:
    mov x10, #0             // Inicializar resultado en 0
    mov x7,  #0             // Inicializar bandera "número activo" en 0 (ningún dígito leído aún)

atoi_loop:
    // Leer byte actual y avanzar puntero
    ldrb w23, [x21], #1

    // verifa si el caracter es un digito
    cmp w23, '0' 
    blt atoi_done           // como es menor que 48 ('0') no es un digito entonces termina

    cmp w23, '9'
    bgt atoi_done           // como es mayor que 57 ('9') no es un digito entonces termina

    // la resta para convertir el caracter a su valor numerico
    sub w23, w23, '0'

    // resultado = resultado * 10
    mov x4, x10
    mul x10, x4, x5         // x10 = x10 * 10

    // resultado = resultado + dígito actual
    add x10, x10, x23       // x10 = x10 + dígito
    mov x7, #1

    b atoi_loop             // Continuar con el siguiente carácter

atoi_done:
    ret

// read_column_to_stack
// Lee el archivo lecturas.csv, extrae todos los valores de la columna x11, los apila en el stack y salta la primera línea 

read_column_to_stack:
    // Guardar link register y frame pointer
    stp x29, x30, [sp, #-16]!
    mov x29, sp

    // Reinicia el error de validacion
    ldr x6, =utils_error_code
    str xzr, [x6]

    mov x5,  #10            // Base decimal para atoi_csv
    mov x22, #0             // Contador de números apilados
    mov x17, #1 // contador la linea actual se empieza en 1 para saltar el encabezado

    // Guardo estos punteros desde el inicio por si hay error antes de leer
    mov x28, sp
    add x27, x28, #16

    // validacion3 linea inicial >= 1
    cmp x13, #1
    blt utils_range_error

    // validacion4 linea final >= linea inicial
    cmp x14, x13
    ble utils_range_error


    // Abrir el archivo
    bl utils_open_file

    // Leer el archivo completo al buffer
    bl utils_read_file

    // Cerrar el archivo 
    bl utils_close_file


    // Apuntar x21 al inicio del buffer
    ldr x21, =utils_buffer

    // Saltar encabezado (primera línea)
    bl utils_skip_to_next_line

    // si se encuentra '$' termina
    cmp w23, '$'
    beq utils_done


utils_process_line:
    mov x12, #1             // Comenzar en la columna 1 de esta línea

    cmp x17, x13 // si la linea actual < linea inicial se salta
    blt utils_skip_line

    cmp x17, x14 // si la linea actual > linea final se salta
    bgt utils_skip_line

// Avanzar hasta la columna deseada
utils_find_column:
    // Verificar si es la columna correcta
    cmp x12, x11
    beq utils_read_column

    // Saltar caracteres hasta encontrar ','
    bl utils_skip_to_next_column

    cmp w23, '$'
    beq utils_done          // Fin de archivo

    cmp w23, #10            
    beq utils_column_error //validacion6

    // Si fue coma, avanzamos el contador de columna y seguimos buscando
    add x12, x12, #1
    b utils_find_column



utils_column_error:
    // Salta directo a imprimir el error de validación en consola y terminar el programa
    b utils_error_validacion



utils_read_column:
    bl atoi_csv
    
    // validacion7
    // si no se leyo ningún dígito, el valor no es numerico
    cbz x7, utils_numeric_error

    // Si despues del numero viene coma, salto de linea o $, es valido
    cmp w23, ','
    beq utils_value_ok

    cmp w23, #10
    beq utils_value_ok

    cmp w23, '$'
    beq utils_value_ok

    // Si viene otra cosa, es valor invalido
    b utils_numeric_error


utils_value_ok:
    bl utils_save_number
    b utils_after_column


utils_numeric_error:
    // Salta directo a imprimir el error de validación en consola y terminar el programa
    b utils_error_validacion



// Después de leer la columna, manejar el resto de la línea
utils_after_column:
    cmp w23, '$'
    beq utils_done          // Fin de archivo

    cmp w23, #10            // si se encuentra '\n', pasar a la siguiente línea
    beq utils_next_line_inc // saltar para incrementar el contador de linea

    // Si no, saltar el resto de la línea hasta '\n' o '$'
    bl utils_skip_to_next_line

    cmp w23, '$'
    beq utils_done

    add x17, x17, #1
    b utils_process_line    // Continuar con la siguiente línea

utils_next_line_inc:
    add x17, x17, #1
    b utils_process_line

// saltar línea completa si está fuera del rango inferior
utils_skip_line:
    bl utils_skip_to_next_line
    cmp w23, '$'
    beq utils_done
    add x17, x17, #1
    b utils_process_line

utils_range_error:
    // Salta directo a imprimir el error de validación en consola y terminar el programa
    b utils_error_validacion


// Todos los datos han sido apilados
utils_done:
    // validacion5
    cmp x17, x14
    blt utils_error_validacion
    
    // validacion8
    // Si el contador de números apilados (x22) es menor que 2, es un error de validacion
    cmp x22, #2
    blt utils_error_validacion

    // Devolver resultados al caller
    // x0 = tope del stack (primer dato)
    // x1 = límite superior (antes de apilar)
    // x2 = cantidad de datos
    // x3 = posición para restaurar stack
    mov x0, sp
    mov x1, x28
    mov x2, x22
    mov x3, x27

    ldr x4, =utils_error_code
    ldr x4, [x4]

    // Restaurar solo el link register (no el sp, eso lo hace el caller con x3)
    ldr x30, [x29, #8]
    ret

// utils_open_file
// Abre el archivo lecturas.csv usando la syscall openat (AT_FDCWD, O_RDONLY).
utils_open_file:
    mov x0, #-100           // AT_FDCWD: directorio de trabajo actual
    ldr x1, =utils_filename // Puntero al nombre del archivo
    mov x2, #0              // O_RDONLY: solo lectura
    mov x3, #0              
    mov x8, #56             
    svc #0

    cmp x0, #0
    blt utils_open_error

    mov x19, x0            
    ret


// utils_read_file
// Lee hasta 4096 bytes del archivo 
// utils_buffer lleno con el contenido del archivo
utils_read_file:
    mov x0, x19             
    ldr x1, =utils_buffer   // Destino de la lectura
    mov x2, #32768           // Máximo a leer (tamaño del buffer)  //4096 //8192 //32768
    mov x8, #63             // Número de syscall: read
    svc #0

    // Verificar error
    cmp x0, #0
    blt utils_read_error

    mov x20, x0             // Guardar bytes leídos en x20
    ret

// utils_close_file
utils_close_file:
    mov x0, x19             // fd a cerrar
    mov x8, #57             // Número de syscall: close
    svc #0
    ret

// utils_skip_to_next_line
// Avanza x21 byte a byte hasta encontrar '\n'  o '$'
// Se usa para saltar el encabezado y para saltar el resto de una línea.
utils_skip_to_next_line:
    ldrb w23, [x21], #1     // Leer byte y avanzar puntero

    cmp w23, '$'
    beq utils_skip_done     // Fin de datos

    cmp w23, #10            // '\n'
    beq utils_skip_done     // Fin de línea

    b utils_skip_to_next_line

// utils_skip_to_next_column
// Avanza x21 byte a byte hasta encontrar ',' '\n' o '$'.
// Se usa para saltar columnas que no nos interesan.
utils_skip_to_next_column:
    ldrb w23, [x21], #1     // Leer byte y avanzar puntero

    cmp w23, '$'
    beq utils_skip_done     // Fin de datos

    cmp w23, #10            // '\n'
    beq utils_skip_done     // Fin de línea

    cmp w23, ','
    beq utils_skip_done     // Separador de columna

    b utils_skip_to_next_column

utils_skip_done:
    ret                     


// utils_save_number
// Apila el valor de x10 en el stack (reserva 16 bytes para alineación aarch64) e incrementa el contador 
// Se reservan 16 bytes (el dato ocupa 8) para mantener el stack alineado a 16 bytes 
utils_save_number:
    sub sp, sp, #16         // Reservar espacio en stack (alineado a 16 bytes)
    str x10, [sp]           // Guardar el número en el tope del stack
    add x22, x22, #1        // Incrementar contador de números guardados
    ret

// print_uint
// Imprime en stdout un entero sin signo 
print_uint:
    stp x29, x30, [sp, #-16]!
    mov x29, sp

    ldr x1, =utils_num_buffer
    add x1, x1, #31         
    mov w2,  #0
    strb w2, [x1]           

    mov x3, #10             
    mov x4, #0              

    // Caso especial: si el número es 0, escribir '0' directamente
    cmp x0, #0
    bne convert_loop_u

    sub x1, x1, #1
    mov w2, '0'
    strb w2, [x1]
    mov x4, #1
    b write_number_u

// Ciclo de conversión: extrae el dígito menos significativo en cada iteración
convert_loop_u:
    udiv x5, x0, x3         // x5 = x0 / 10 (cociente)
    msub x6, x5, x3, x0     // x6 = x0 - (x5 * 10)  

    add x6, x6, '0'         // Convertir dígito a ASCII

    sub x1, x1, #1          // Avanzar puntero hacia la izquierda
    strb w6, [x1]           // Escribir dígito ASCII

    add x4, x4, #1          // Incrementar contador de dígitos

    mov x0, x5              // Siguiente número = cociente
    cbnz x0, convert_loop_u // Si cociente != 0, seguir

write_number_u:
    mov x0, #1              
    mov x2, x4              
    mov x8, #64             
    svc #0

    ldp x29, x30, [sp], #16
    ret

// write_file_open
// Crea arm64_results/ si no existe y abre el archivo de salida dentro de esa carpeta.
write_file_open:
    mov x9, x1              // Guardar el nombre de archivo original

    // Intentar crear la carpeta de resultados
    mov x0, #-100           
    ldr x1, =utils_results_dir
    mov x2, #493            
    mov x8, #34             
    svc #0

    mov x4, #-17            
    cmp x0, x4
    beq write_file_open_build_path

    cmp x0, #0
    blt write_file_open_error

write_file_open_build_path:
    // Construir la ruta completa arm64_results/<archivo>
    ldr x2, =utils_output_path
    mov x3, x2
    ldr x4, =utils_results_dir

write_file_open_copy_dir:
    ldrb w5, [x4], #1
    strb w5, [x3], #1
    cbnz w5, write_file_open_copy_dir

    sub x3, x3, #1         

write_file_open_copy_name:
    ldrb w5, [x9], #1
    strb w5, [x3], #1
    cbnz w5, write_file_open_copy_name

    // Abrir el archivo de salida dentro de arm64_results/
    mov x0, #-100           
    ldr x1, =utils_output_path
    mov x2, #577            
    mov x3, #420           
    mov x8, #56             
    svc #0

    // Verificar error
    cmp x0, #0
    blt write_file_open_error

    mov x19, x0             
    ret
utils_open_error:
write_file_open_error:
    // Imprimir error y salir
    mov x0, #2           
    ldr x1, =utils_err_open
    mov x2, utils_err_open_len
    mov x8, #64
    svc #0

    mov x0, #1
    mov x8, #93
    svc #0

write_file_write:
    mov x0, x19             
    mov x8, #64             // syscall: write
    svc #0

    cmp x0, #0
    blt write_file_write_error
    ret
    
utils_read_error:
write_file_write_error:
    mov x0, #2              
    ldr x1, =utils_err_open
    mov x2, utils_err_open_len
    mov x8, #64
    svc #0

    mov x0, #1
    mov x8, #93
    svc #0

// write_file_close
write_file_close:
    mov x0, x19             
    mov x8, #57             // syscall: close
    svc #0
    ret

// utils_error_validacion
// imprimir en la consola eror de validacion y termina el programa
utils_error_validacion:
    // guardar el contexto en el stack por seguridad 
    stp x29, x30, [sp, #-16]!
    mov x29, sp

    ldr x1, =utils_err_filename        
    bl write_file_open                  

    ldr x1, =utils_err_file_content     
    mov x2, utils_err_file_content_len 
    bl write_file_write                 

    bl write_file_close                
    mov x0, #2                          
    ldr x1, =utils_err_validacion       
    mov x2, utils_err_validacion_len   
    mov x8, #64                         
    svc #0                              

    mov x0, #1                          
    mov x8, #93                        
    svc #0
                                  