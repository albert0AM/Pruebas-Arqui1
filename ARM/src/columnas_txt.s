// Nombres de columnas para el reporte
.data

txt_col1:
    .ascii "TEMP"
    txt_col1_len = . - txt_col1

txt_col2:
    .ascii "HUM_AIRE"
    txt_col2_len = . - txt_col2

txt_col3:
    .ascii "HUM_SUELO_1"
    txt_col3_len = . - txt_col3

txt_col4:
    .ascii "HUM_SUELO_2"
    txt_col4_len = . - txt_col4

txt_col5:
    .ascii "LUZ"
    txt_col5_len = . - txt_col5

txt_col6:
    .ascii "GAS"
    txt_col6_len = . - txt_col6

txt_col7:
    .ascii "RIEGO_1"
    txt_col7_len = . - txt_col7

txt_col8:
    .ascii "RIEGO_2"
    txt_col8_len = . - txt_col8

.text

write_column_name:
    stp x29, x30, [sp, #-16]!
    mov x29, sp
    cmp x11, #1
    beq col1
    cmp x11, #2
    beq col2
    cmp x11, #3
    beq col3
    cmp x11, #4
    beq col4
    cmp x11, #5
    beq col5
    cmp x11, #6
    beq col6
    cmp x11, #7
    beq col7
    b col8

col1:
    ldr x1, =txt_col1
    mov x2, #txt_col1_len
    b escribir_col
col2:
    ldr x1, =txt_col2
    mov x2, #txt_col2_len
    b escribir_col
col3:
    ldr x1, =txt_col3
    mov x2, #txt_col3_len
    b escribir_col
col4:
    ldr x1, =txt_col4
    mov x2, #txt_col4_len
    b escribir_col
col5:
    ldr x1, =txt_col5
    mov x2, #txt_col5_len
    b escribir_col
col6:
    ldr x1, =txt_col6
    mov x2, #txt_col6_len
    b escribir_col
col7:
    ldr x1, =txt_col7
    mov x2, #txt_col7_len
    b escribir_col
col8:
    ldr x1, =txt_col8
    mov x2, #txt_col8_len

escribir_col:
    bl write_file_write
    ldp x29, x30, [sp], #16
    ret
    
    