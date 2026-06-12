# Template: ARM64 en host x86 y x64 con QEMU (flujo mínimo, un solo main.s)
# Copia este archivo como Makefile dentro de la lección.

# ---------------------------------------------------------
# Toolchain
# ---------------------------------------------------------
AS      = aarch64-linux-gnu-as
LD      = aarch64-linux-gnu-ld
QEMU    = qemu-aarch64

# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------
SRC     = main.s
BUILD   = build
OBJ     = $(BUILD)/main.o
BIN     = $(BUILD)/main

# ---------------------------------------------------------
# Flags
# ---------------------------------------------------------
ASFLAGS = -g                    # símbolos de debug
LDFLAGS =

# ---------------------------------------------------------
# Targets
# ---------------------------------------------------------

# Compilación por defecto
all: $(BIN)

# Crear carpeta build si no existe
$(BUILD):
	mkdir -p $(BUILD)

# Ensamblar
$(OBJ): $(SRC) | $(BUILD)
	$(AS) $(ASFLAGS) -o $@ $<

# Enlazar
$(BIN): $(OBJ)
	$(LD) $(LDFLAGS) -o $@ $<

# Ejecutar en QEMU user-mode
run: $(BIN)
	$(QEMU) $(BIN)

# ---------------------------------------------------------
# Debug con QEMU + GDB remoto
# ---------------------------------------------------------
gdb: $(BIN)
	@echo "Starting QEMU and waiting for GDB on port 1234..."
	$(QEMU) -g 1234 $(BIN)

# ---------------------------------------------------------
# Limpieza
# ---------------------------------------------------------
clean:
	rm -rf $(BUILD)

# ---------------------------------------------------------
# Utilidades
# ---------------------------------------------------------
info:
	@echo "Targets disponibles:"
	@echo "  make        -> compila el programa"
	@echo "  make run    -> ejecuta en QEMU"
	@echo "  make gdb    -> QEMU + espera GDB (VS Code)"
	@echo "  make clean  -> limpia build/"