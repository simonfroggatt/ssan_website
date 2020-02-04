import os
import glob


# Function to rename multiple files
def main():
    for file in glob.glob('*-&-*'):
        src = os.path.basename(file)
        dest = src.replace("-&-", "-")
        os.rename(src, dest)
        print(dest)


# Driver Code
if __name__ == '__main__':
    # Calling main() function
    main()