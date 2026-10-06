CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -O2 -I.
TARGET = simulator.exe

SRCS = main.c simulator.c deadlock.c prevention.c display.c graph.c trace.c
OBJS = $(SRCS:.c=.o)

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $(TARGET) $(OBJS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

test-safe: $(TARGET)
	./$(TARGET) --test-safe

test-deadlock: $(TARGET)
	./$(TARGET) --test-deadlock

test-request: $(TARGET)
	./$(TARGET) --test-request

test-all: $(TARGET)
	./$(TARGET) --test-all

clean:
	rm -f $(OBJS) $(TARGET) simulator

.PHONY: all clean test-safe test-deadlock test-request test-all
