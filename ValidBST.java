package Leet;

//https://leetcode.com/problems/validate-binary-search-tree/submissions/

public class ValidBST {
}
/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */
class Solution {
    public boolean isValidBST(TreeNode root) {
        if(root == null) return true;
        boolean l = isValidBST(root.left);
        boolean r = isValidBST(root.right);
        if(r && l){
            double max = findMax(root.left);
            double min = findMin(root.right);
            return max<root.val && root.val<min;
        }
        return false;
        // Bst bst = findValid(root);
        // return bst.bst;
    }
    // Bst findValid(TreeNode root){
    //     if(root == null) return new Bst();
    //     Bst l = findValid(root.left);
    //     Bst r = findValid(root.right);
    //     Bst res = new Bst();
    //     if(l.bst && r.bst){
    //         res.bst = root.val>l.max && root.val<r.min;
    //     }else{
    //         res.bst = false;
    //     }
    //     res.max = Math.max(root.val,Math.max(l.max,r.max));
    //     res.min = Math.min(root.val,Math.min(l.min,r.min));
    //     return res;
    // }
    double findMax(TreeNode root){
        if(root == null) return Double.NEGATIVE_INFINITY;
        double l = findMax(root.left);
        double r = findMax(root.right);
        return Math.max(root.val,Math.max(l,r));

    }
    double findMin(TreeNode root){
        if(root == null) return Double.POSITIVE_INFINITY;
        double l = findMin(root.left);
        double r = findMin(root.right);
        return Math.min(root.val,Math.min(l,r));
    }


}

// class Bst{
//     boolean bst = true;
//     double min = Double.POSITIVE_INFINITY;
//     double max = Double.NEGATIVE_INFINITY;
// }
