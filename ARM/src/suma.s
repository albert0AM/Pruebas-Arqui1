.data

msg_no_arg:
    .ascii "Debe enviar una columna\n"
    msg_no_arg_len = . - msg_no_arg

msg_result:
    .ascii "Suma: "
    msg_result_len = . - msg_result

newline:
    .ascii "\n"

.text

.include "utils.s"

.global _start

_start:
    // argc esta en [sp]
    ldr x0, [sp]

    // validar que exista argv[1]
    cmp x0, #2
    blt no_argumento

    // argv[1] esta en [sp + 16]
    ldr x21, [sp, #16]
    mov x5, #10

    // convertir parametro a numero
    bl atoi_csv

    // si no leyo numero, error
    cbz x7, no_argumento

    // x11 = columna seleccionada
    mov x11, x10

    // llamar a utils
    bl read_column_to_stack

    // guardar salidas de utils
    mov x24, x0             // puntero actual para recorrer stack
    mov x25, x1             // limite final
    mov x26, x2             // cantidad de datos
    mov x27, x3             // posicion para restaurar stack

    // suma total
    mov x28, #0

sum_loop:
    cmp x24, x25
    beq print_result

    ldr x10, [x24], #16
    add x28, x28, x10

    b sum_loop

print_result:
    mov x0, #1
    ldr x1, =msg_result
    mov x2, msg_result_len
    mov x8, #64
    svc #0

    mov x0, x28
    bl print_uint

    mov x0, #1
    ldr x1, =newline
    mov x2, #1
    mov x8, #64
    svc #0

    mov sp, x27

    b exit_ok

no_argumento:
    mov x0, #1
    ldr x1, =msg_no_arg
    mov x2, msg_no_arg_len
    mov x8, #64
    svc #0

    b exit_error

exit_ok:
    mov x0, #0
    mov x8, #93
    svc #0

exit_error:
    mov x0, #1
    mov x8, #93
    svc #0