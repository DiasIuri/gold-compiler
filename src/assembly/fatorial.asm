.data
	bl:		.asciiz "\n"
	number:		.word 0
	fatorial:		.word 0
	text0:		.asciiz "Digite o numero para calcular o fatorial: "
	text1:		.asciiz "Serio?"
	text2:		.asciiz "O fatorial e: 1"
	text3:		.asciiz "O fatorial e: "

.text
main:
# Line 4 - Output 
la $a0, text0
jal printText
jal breakLine

# Line 5 - Input 
jal userInput
sw $v0, number
jal breakLine

# Line 6 - If 
lw $s7, number
addi $s6, $zero, 0
bge $s7, $s6, else0

if0:
# Line 7 - Output 
la $a0, text1
jal printText
jal breakLine

# Line 8 - End if 
j endElse0

else0:
# Line 9 - Elif 
# Line 10 - If 
lw $s7, number
addi $s6, $zero, 0
bne $s7, $s6, else1

if1:
# Line 11 - Output 
la $a0, text2
jal printText
jal breakLine

# Line 12 - End if 
j endElse1

else1:
# Line 13 - Else 
# Line 14 - Assignment 
lw $s7, number
sw $s7, fatorial

# Line 15 - While 
lw $s7, number
addi $s6, $zero, 2
bgt $s7, $s6, while0
j endWhile0

while0:
# Line 16 - Assignment 
lw $s7, number
sub $t0, $s7, 1

# Line 17 - Assignment 
lw $s7, fatorial
mul $s7, $s7, $t0
sw $s7, fatorial

# Line 18 - Assignment 
lw $s7, number
sub $s7, $s7, 1
sw $s7, number

# Line 19 - End while 
lw $s7, number
addi $s6, $zero, 2
bgt $s7, $s6, while0

endWhile0:
# Line 20 - Output 
la $a0, text3
jal printText
jal breakLine

# Line 21 - Output 
lw $a0, fatorial
jal printValue
jal breakLine

# Line 22 - End if 

endElse1:

endElse0:
j finishProgram

printValue:
li $v0, 1
syscall
jr $ra

printText:
li $v0, 4
syscall
jr $ra

userInput:
li $v0, 5
syscall
jr $ra

breakLine:
li $v0, 4
la $a0, bl
syscall
jr $ra

finishProgram:
li $v0, 10
syscall

