# 外排序

外排序不同于内排序，其数据存储在外存中，排序结果一般也是写入外存，这也使得其有许多不同于内排序的地方。

## 基本介绍

当要对一个文件的数据进行排序时，我们通常的想法是将其读入内存，在内存排序后写回文件，但当数据量特别大、内存不够的时候，这种方法就无法奏效了，这就是我们需要研究外排序的原因。

文件指存储在外存上的数据结构，一般分为两种：操作系统的文件和数据库文件，数据库文件的操作我不了解，这里主要涉及操作系统的文件，关于 `Java` 如何对操作系统的文件进行操作，可以参考[这篇笔记](https://www.yuque.com/gorit/learnjava/java_se_08)。

外排序朴素的方法是每次从头到尾扫描文件，将最小的记录输出到输出文件，但这样文件读写会十分频繁，次数很多，性能不够高效，通常的方法是先对待排序的记录（在文件中）分割形成若干个排好序的文件，再将这些文件合并为一个新的结果，方法与内排序的归并排序很相似。

## 分割形成顺串

将一个大的文件的记录分割成若干个排好序的小文件，最朴素的方法应该是每次从头到尾扫描文件，遇到比当前输出文件最后一个记录（也就是上一个写入的记录）大的记录就写入输出文件，直至分割完成。但事实上这种方法并不高效，只考虑了下一个记录，不能形成尽量长的顺串，一个简单的例子是大的文件是逆序的，那么得到的小文件将都只有一个记录的，归并的时候效率也将很低。要形成尽量长的顺串，一个方法是每次不只是考虑下一个记录，而是考虑若干个记录（应该能保存在内存中），将这些记录中最小的输出，这就很容易联想到最小堆，这个方法就是置换选择排序。

我们在内存中建立一个最小堆，限制其大小为某个固定的值，从输入文件中读取记录填满这个堆（应该是能填满的，如果不能填满那事实上就是内排序中的堆排序），不同于一般地堆排序，我们不是简单的依次弹出堆顶元素，而是考虑从文件中重新读入记录替换堆定的元素。具体的思路是，如果重新读入的记录比弹出的记录要小，那么与普通的最小堆一样弹出堆顶，重新读入的记录保存在内存中但不进入最小堆（实际上是在最小堆的数组中，但调整了最小堆的大小使得这个纪录不作为最小堆的一部分）；如果重新读入的记录比弹出地记录要大，则将新的记录作为新的堆顶，重新构建最小堆。直至最小堆清空或文件全部读入，这是最小堆的数组被我们之前保存的记录填满了，重新构建最小堆，重复上面的操作，直至最小堆清空且文件全部读入。

这里用到的最小堆与通常的最小堆不同，需要支持置换操作，所以通常需要自己重新设计，基本的代码如下：

```java
// 为置换选择排序设计的最小堆，考虑可能只在包内部使用，其他地方不大可能需要，故设计为仅包内部可访问
class MinHeap<T extends Comparable<T>> {
    private final ArrayList<T> data;  // 堆数组
    private int capacity;  // 堆的容量
    private int heapSize;  // 堆的大小
    private int totalSize;  // 实际数组的大小，一般是与堆的容量一样大，但当文件读完后可能会不一样

    // 构造函数
    MinHeap(int capacity) {
        data = new ArrayList<>(Collections.nCopies(capacity, null));
        this.capacity = capacity;
        heapSize = 0;
        totalSize = 0;
    }


    /**
     * Add a value to the heap.
     * @param value The value to be added.
     */
    void add(T value) {
        if (heapSize == capacity) {
            throw new IndexOutOfBoundsException("Can't add an element to a full heap.");
        }
        data.set(heapSize, value);
        heapSize++;
        totalSize++;
        swimUp(heapSize - 1);
    }

    /**
     * Replace the root of the heap with a new value.
     * @param value The new value to replace the root.
     * @return The old root value.
     */
    T replace(T value) {
        if (heapSize == 0) {
            throw new IndexOutOfBoundsException("Can't replace a empty heap.");
        }
        T result = data.getFirst();
        if (less(value, result)) {
            data.set(0, data.get(heapSize - 1));
            data.set(heapSize - 1, value);
            heapSize--;
        } else {
            data.set(0, value);
        }
        sinkDown(0);
        return result;
    }

    /**
     * Get the root value of the heap.
     * @return The root value.
     */
    T poll() {
        if (heapSize == 0) {
            throw new IndexOutOfBoundsException("Can't poll form an empty heap.");
        }
        T result = data.getFirst();
        data.set(0, data.get(heapSize - 1));
        data.set(heapSize - 1, null);
        heapSize--;
        totalSize--;
        sinkDown(0);
        return result;
    }

    /**
     * Check if the heap is empty.
     * @return True if the heap is empty, false otherwise.
     */
    boolean isEmpty() {
        return heapSize == 0;
    }

    /**
     * Check if the heap is full.
     * @return True if the heap is full, false otherwise.
     */
    boolean isFull() {
        return heapSize == capacity;
    }

    /**
     * Rebuild the heap.
     */
    void reBuild() {
        heapSize = totalSize;
        for (int i = heapSize / 2 - 1; i >= 0; i--) {
            sinkDown(i);
        }
    }

    /**
     * Get the root value of the heap.
     *
     * @param i The index of the value to swim up.
     */
    private void swimUp(int i) {
        if (i == 0) {
            return;
        }
        int parent = (i - 1) / 2;
        if (less(data.get(i), data.get(parent))) {
            swap(i, parent);
            swimUp(parent);
        }
    }

    /**
     * Sink down the value at index i.
     * @param i The index of the value to sink down.
     */
    private void sinkDown(int i) {
        int left_child = i * 2 + 1;
        int right_child = i * 2 + 2;
        if (left_child >= heapSize) {
            return;
        }
        if (right_child >= heapSize) {
            if (less(data.get(left_child), data.get(i))) {
                swap(i, left_child);
                sinkDown(left_child);
            }
            return;
        }
        if (less(data.get(left_child), data.get(right_child))) {
            if (less(data.get(left_child), data.get(i))) {
                swap(left_child, i);
                sinkDown(left_child);
            }
        } else if (less(data.get(right_child), data.get(i))) {
            swap(right_child, i);
            sinkDown(right_child);
        }
    }

    private boolean less(T lhs, T rhs) {
        return lhs.compareTo(rhs) < 0;
    }

    private void swap(int i, int j) {
        T temp = data.get(i);
        data.set(i, data.get(j));
        data.set(j, temp);
    }
}
```

置换选择排序的算法可以使用这个最小堆，设计如下：

```java
public class ReplacementSelectionSort {

    public static void sort(String inputFilePath, String outputFileDir, int capacity) throws IOException {
        MinHeap<Integer> heap = new MinHeap<Integer>(capacity);
        BufferedReader reader = new BufferedReader(new FileReader(inputFilePath));
        int counter = 1;
        while (!heap.isFull()) {
            String line = reader.readLine();
            if (line == null) {
                break;
            }
            heap.add(Integer.valueOf(line));
        }
        while (!heap.isEmpty()) {
            String outputFilePath = outputFileDir + "/" + counter++ + ".txt";
            System.out.println(outputFilePath);
            BufferedWriter writer = new BufferedWriter(new FileWriter(outputFilePath));
            while (!heap.isEmpty()) {
                String line = reader.readLine();
                if (line == null) {
                    writer.write(heap.poll().toString());
                } else {
                    writer.write(heap.replace(Integer.valueOf(line)).toString());
                }
                writer.newLine();
            }
            writer.flush();
            writer.close();
            heap.reBuild();
        }
        reader.close();
    }
}
```

我对 `Java` 程序设计不是很熟悉，所以设计的可能并不是很好，欢迎批评指正。
