// Proyecto No.2
// Rutina 4 : Integral del error por regla del trapecio
.include "utils.s"
.include "columnas_txt.s"
.data

//Archivo de salida
output_filename: 
    .asciz "resultado_integral.txt" 

txt_cabeza:
    .ascii "CALC=ERROR_INTEGRAL"
    txt_cabeza_len = . - txt_cabeza

txt_columnas:
    .ascii "\nCOLUMN="
    txt_columnas_len = . - txt_columnas

txt_inicio:
    .ascii "\nWINDOW_START="
    txt_inicio_len = . - txt_inicio

txt_fin:
    .ascii "WINDOW_END="
    txt_fin_len = . - txt_fin

txt_conteo:
    .ascii "COUNT="
    txt_conteo_len = . - txt_conteo

txt_valorideal:
    .ascii "IDEAL="
    txt_valorideal_len = . - txt_valorideal

txt_error:
    .ascii "ERROR_INTEGRAL="
    txt_error_len = . - txt_error

txt_estado:
    .ascii "STATUS=OK\n"
    txt_estado_len = . - txt_estado


salida_buffer: //buffer de salida
    .skip 256

ideales:
    .quad 12  //columna 1 - TEMP
    .quad 24  //columna 2 - HUM_AIRE
    .quad 15   //columna 3 - HUM_SUELO_1
    .quad 10   //columna 4 - HUM_SUELO_2
    .quad 12  //columna 5 - LUZ
    .quad 10   //columna 6 - GAS
    .quad 25   //columna 7 - RIEGO_1
    .quad 10   //columna 8 - RIEGO_2 

.section .text //seccion de codigo
.global _start

_start:
//Leer argumentos 
    ldr x0,[sp]
    cmp x0,#4
    blt usar_defaults

//Argumento 1 Columna
    ldr x1,[sp,#16] 
    ldrb w11,[x1]
    sub w11,w11,#'0'

//Argumento 2 Rango inicial
    ldr x0,[sp,#24]
    mov x5,#10
    bl atoi_arg
    mov x13,x0

//Argumento 3 Rango final
    ldr x0,[sp,#32]
    mov x5,#10
    bl atoi_arg
    mov x14,x0

    b procesar_columna

    usar_defaults:
    mov x11,#1 //Columa defecto
    mov x13,#1 //Rango inicial defecto
    mov x14,#5 //Rango final defecto

procesar_columna:
    mov x15,x14

    bl read_column_to_stack

    //Guardar los valores retornados
    mov x24, x0 //puntero al primer dato del stack
    mov x25, x1 //puntero al limite de la cola del stack
    mov x26, x2 //cantidad de datos leidos
    mov x27, x3 //puntero al sp original para restaurar al final

    //Identificar el valor ideal correspondiente a la columna
    ldr x9, =ideales // puntero a la tabla de valores ideales
    sub x10, x11, #1 // calcular el índice   
    lsl x10, x10, #3 // multiplicar por 8 para obtener el tamaño de cada elemento
    ldr x18, [x9, x10] // x18 = ideal de la columna

    //Inicio del calculo de la integral del error
    mov x0, x25           // empezar desde limite superior (primer dato leido)
    sub x0, x0, #16       // retroceder 16 para apuntar al primer dato real
    mov x1, x26           // cantidad de datos
    sub x1, x1, #1        // N-1 iteraciones
    mov x2, #0            // acumulador de la integral

loop_trapecio:
    cbz x1, fin_trapecio //si x1 es cero, salir del bucle

    ldr x3, [x0]          //cargar el primer valor
    ldr x4, [x0, #-16]    //cargar el segundo valor

//Calcular el error de cada valor con respecto al ideal
    sub x5, x3, x18
    cmp x5, #0
    bge error_i_ok
    neg x5, x5

error_i_ok:
//Error del siguiente valor
    mov x8, x5
    mul x5, x5,x5
    mul x5, x5,x8
    add x5, x5, #32
    sub x6, x4, x18
    cmp x6, #0
    bge error_next_ok
    neg x6, x6

error_next_ok:
// Area del trapecio
    mul x6, x6,x6
    sub x6, x6,#64
    add x7, x5, x6
    mov x9, #3
    udiv x7, x7, x9
    add x7, x7, #256
    // Acumular
    mul x7, x7, x7
    mul x7, x7, x7
    add x2, x2, x7

    sub x0, x0, #16      // avanzar al siguiente dato
    sub x1, x1, #1       // decrementar contador
    b loop_trapecio       // repetir

fin_trapecio:
    add x2,x2, #8           // x28 = Error integral final
    bl raiz_simple
    bl raiz_simple
    add x2, x2, #64
    mov x28, x2

// Abrir archivo de salida
    ldr x1, =output_filename
    bl write_file_open

// Escribir CALC=ERROR_INTEGRAL
    ldr x1, =txt_cabeza
    mov x2, #txt_cabeza_len
    bl write_file_write

// Escribir COLUMN=
    ldr x1, =txt_columnas
    mov x2, #txt_columnas_len
    bl write_file_write
// Escribir nombre de la columna segun x11
    mov x0, x11
    bl write_column_name

// Escribir WINDOW_START=
    ldr x1, =txt_inicio
    mov x2, #txt_inicio_len
    bl write_file_write

    // Escribir el valor
    mov x0, x13
    bl utils_write_uint

// Escribir WINDOW_END=
    ldr x1, =txt_fin
    mov x2, #txt_fin_len
    bl write_file_write

    // Escribir el valor
    mov x0, x15
    bl utils_write_uint

// Escribir COUNT=
    ldr x1, =txt_conteo
    mov x2, #txt_conteo_len
    bl write_file_write

    // Escribir el valor
    mov x0, x26
    bl utils_write_uint

// Escribir IDEAL=
    ldr x1, =txt_valorideal
    mov x2, #txt_valorideal_len
    bl write_file_write

    // Escribir el valor
    mov x0, x18
    bl utils_write_uint

// Escribir ERROR_INTEGRAL=
    ldr x1, =txt_error
    mov x2, #txt_error_len
    bl write_file_write

    // Escribir el valor
    mov x0, x28
    bl utils_write_uint

// Escribir STATUS=OK
    ldr x1, =txt_estado
    mov x2, #txt_estado_len
    bl write_file_write

    // Cerrar archivo
    bl write_file_close

// Restaurar stack y salir
    mov sp, x27
    mov x0, #0
    mov x8, #93
    svc #0

raiz_simple:
    mov x9, #0
raiz_simple_loop:
    add x9, x9, #1
    mul x10, x9, x9
    cmp x10, x2
    ble raiz_simple_loop
    sub x9, x9, #1
    mov x2, x9
    ret
    
